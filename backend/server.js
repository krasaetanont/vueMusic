const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Pool } = require('pg');

const app = express();
const port = 3000;

// Ensure upload directories exist
const musicDir = '/musicFiles';
const lyricsDir = '/lyrics';

if (!fs.existsSync(musicDir)) {
  fs.mkdirSync(musicDir, { recursive: true });
}
if (!fs.existsSync(lyricsDir)) {
  fs.mkdirSync(lyricsDir, { recursive: true });
}

// Database configuration
const pool = new Pool({
  host: process.env.DB_HOST || 'db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'mysecret',
  database: process.env.DB_NAME || 'musicdb',
  port: process.env.DB_PORT || 5432,
});

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, musicDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const filename = `${uniqueSuffix}${ext}`;
    cb(null, filename);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg', 'audio/mp4', 'audio/x-m4a'];
    if (allowedMimes.includes(file.mimetype) || file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only audio files are allowed.'));
    }
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Static file serving for music and lyrics
app.use('/music', express.static('/musicFiles'));
app.use('/lyrics', express.static('/lyrics'));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

// ==================== FILE UPLOAD ENDPOINT ====================

// Upload music file with metadata
app.post('/api/upload', upload.single('musicFile'), async (req, res) => {
  const client = await pool.connect();
  
  try {
    const { title, artist, genre } = req.body;
    
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    if (!title || !artist || !genre) {
      //   uploaded file if validation fails
      fs.unlinkSync(req.file.path);
      return res.status(400).json({ error: 'Title, artist, and genre are required' });
    }

    await client.query('BEGIN');

    // Get or create artist (using INSERT ... ON CONFLICT for atomic upsert)
    const artistResult = await client.query(
      `INSERT INTO artists (name) 
       VALUES ($1) 
       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name 
       RETURNING id`,
      [artist.trim()]
    );
    const artistId = artistResult.rows[0].id;

    // Get or create genre (using INSERT ... ON CONFLICT for atomic upsert)
    const genreResult = await client.query(
      `INSERT INTO genres (name) 
       VALUES ($1) 
       ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name 
       RETURNING id`,
      [genre.trim()]
    );
    const genreId = genreResult.rows[0].id;

    // Insert music record
    const filePath = `/music/${req.file.filename}`;
    const musicResult = await client.query(
      'INSERT INTO musics (title, file_path) VALUES ($1, $2) RETURNING *',
      [title.trim(), filePath]
    );
    const music = musicResult.rows[0];

    // Link artist to music
    await client.query(
      'INSERT INTO music_artists (music_id, artist_id) VALUES ($1, $2)',
      [music.id, artistId]
    );

    // Link genre to music
    await client.query(
      'INSERT INTO music_genres (music_id, genre_id) VALUES ($1, $2)',
      [music.id, genreId]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Upload successful',
      music: {
        id: music.id,
        title: music.title,
        file_path: music.file_path,
        artist: { id: artistId, name: artist.trim() },
        genre: { id: genreId, name: genre.trim() }
      }
    });

  } catch (error) {
    await client.query('ROLLBACK');
    
    // Delete uploaded file if database operation fails
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  } finally {
    client.release();
  }
});

// Upload lyric text for a music item and save as HTML file
app.post('/api/upload/lyric/:id', express.text({ type: '*/*' }), async (req, res) => {
  const client = await pool.connect();
  const { id } = req.params;
  const text = req.body;

  if (!text || typeof text !== 'string') {
    client.release();
    return res.status(400).json({ error: 'Lyric text is required' });
  }

  const filename = `${id}.html`;
  const filePath = `/lyrics/${filename}`;
  const fullPath = path.join(lyricsDir, filename);

  try {
    // Write lyric HTML file (overwrites if exists)
    fs.writeFileSync(fullPath, text, 'utf8');

    // Update database with lyric_path
    const result = await client.query(
      'UPDATE musics SET lyric_path = $1 WHERE id = $2 RETURNING *',
      [filePath, id]
    );

    if (result.rows.length === 0) {
      // music id not found — remove saved file
      if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
      return res.status(404).json({ error: 'Music not found' });
    }

    res.status(200).json({ message: 'Lyric uploaded', music: result.rows[0] });
  } catch (err) {
    console.error('Lyric upload error:', err);
    if (fs.existsSync(fullPath)) {
      try { fs.unlinkSync(fullPath); } catch (e) { /* ignore cleanup error */ }
    }
    res.status(500).json({ error: 'Failed to upload lyric' });
  } finally {
    client.release();
  }
});

// Delete lyric file and clear lyric_path for a music item
app.delete('/api/delete/lyric/:id', async (req, res) => {
  const client = await pool.connect();
  const { id } = req.params;
  const filename = `${id}.html`;
  const fullPath = path.join(lyricsDir, filename);

  try {
    await client.query('BEGIN');

    // Ensure music exists
    const musicResult = await client.query('SELECT id, lyric_path FROM musics WHERE id = $1', [id]);
    if (musicResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Music not found' });
    }

    // Clear lyric_path in DB
    const updateResult = await client.query(
      'UPDATE musics SET lyric_path = NULL WHERE id = $1 RETURNING *',
      [id]
    );

    // Delete file if it exists
    if (fs.existsSync(fullPath)) {
      try {
        fs.unlinkSync(fullPath);
      } catch (fsErr) {
        // If file deletion fails, rollback and surface error
        await client.query('ROLLBACK');
        console.error('Failed to delete lyric file:', fsErr);
        return res.status(500).json({ error: 'Failed to delete lyric file' });
      }
    }

    await client.query('COMMIT');
    res.json({ message: 'Lyric deleted', music: updateResult.rows[0] });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Error deleting lyric:', err);
    res.status(500).json({ error: 'Failed to delete lyric' });
  } finally {
    client.release();
  }
});

// ==================== MUSIC ENDPOINTS ====================

// Get all musics with their artists and genres
app.get('/api/musics', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        m.id, m.title, m.file_path, m.lyric_path, m.uploaded_at,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object('id', a.id, 'name', a.name)) 
          FILTER (WHERE a.id IS NOT NULL), '[]'
        ) as artists,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object('id', g.id, 'name', g.name)) 
          FILTER (WHERE g.id IS NOT NULL), '[]'
        ) as genres
      FROM musics m
      LEFT JOIN music_artists ma ON m.id = ma.music_id
      LEFT JOIN artists a ON ma.artist_id = a.id
      LEFT JOIN music_genres mg ON m.id = mg.music_id
      LEFT JOIN genres g ON mg.genre_id = g.id
      GROUP BY m.id
      ORDER BY m.uploaded_at DESC
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get single music by ID
app.get('/api/musics/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        m.id, m.title, m.file_path, m.lyric_path, m.uploaded_at,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object('id', a.id, 'name', a.name)) 
          FILTER (WHERE a.id IS NOT NULL), '[]'
        ) as artists,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object('id', g.id, 'name', g.name)) 
          FILTER (WHERE g.id IS NOT NULL), '[]'
        ) as genres,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object('id', p.id, 'name', p.name)) 
          FILTER (WHERE p.id IS NOT NULL), '[]'
        ) as playlists
      FROM musics m
      LEFT JOIN music_artists ma ON m.id = ma.music_id
      LEFT JOIN artists a ON ma.artist_id = a.id
      LEFT JOIN music_genres mg ON m.id = mg.music_id
      LEFT JOIN genres g ON mg.genre_id = g.id
      LEFT JOIN music_playlists mp ON m.id = mp.music_id
      LEFT JOIN playlists p ON mp.playlist_id = p.id
      WHERE m.id = $1
      GROUP BY m.id
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Music not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Create new music
app.post('/api/musics', async (req, res) => {
  const client = await pool.connect();
  try {
    const { title, file_path, lyric_path, artist_ids, genre_ids } = req.body;
    
    await client.query('BEGIN');
    
    // Insert music
    const musicResult = await client.query(
      'INSERT INTO musics (title, file_path, lyric_path) VALUES ($1, $2, $3) RETURNING *',
      [title, file_path, lyric_path || null]
    );
    const music = musicResult.rows[0];
    
    // Link artists
    if (artist_ids && artist_ids.length > 0) {
      for (const artistId of artist_ids) {
        await client.query(
          'INSERT INTO music_artists (music_id, artist_id) VALUES ($1, $2)',
          [music.id, artistId]
        );
      }
    }
    
    // Link genres
    if (genre_ids && genre_ids.length > 0) {
      for (const genreId of genre_ids) {
        await client.query(
          'INSERT INTO music_genres (music_id, genre_id) VALUES ($1, $2)',
          [music.id, genreId]
        );
      }
    }
    
    await client.query('COMMIT');
    res.status(201).json(music);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    client.release();
  }
});

// Update music
app.put('/api/musics/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { title, file_path, lyric_path, artist_ids, genre_ids } = req.body;
    
    await client.query('BEGIN');
    
    // Update music
    const musicResult = await client.query(
      'UPDATE musics SET title = $1, file_path = $2, lyric_path = $3 WHERE id = $4 RETURNING *',
      [title, file_path, lyric_path || null, id]
    );
    
    if (musicResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Music not found' });
    }
    
    // Update artists
    if (artist_ids !== undefined) {
      await client.query('DELETE FROM music_artists WHERE music_id = $1', [id]);
      if (artist_ids.length > 0) {
        for (const artistId of artist_ids) {
          await client.query(
            'INSERT INTO music_artists (music_id, artist_id) VALUES ($1, $2)',
            [id, artistId]
          );
        }
      }
    }
    
    // Update genres
    if (genre_ids !== undefined) {
      await client.query('DELETE FROM music_genres WHERE music_id = $1', [id]);
      if (genre_ids.length > 0) {
        for (const genreId of genre_ids) {
          await client.query(
            'INSERT INTO music_genres (music_id, genre_id) VALUES ($1, $2)',
            [id, genreId]
          );
        }
      }
    }
    
    await client.query('COMMIT');
    res.json(musicResult.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    client.release();
  }
});

// Delete music
app.delete('/api/musics/:id', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    
    await client.query('BEGIN');
    
    // Get file paths before deleting
    const musicResult = await client.query(
      'SELECT file_path, lyric_path FROM musics WHERE id = $1', 
      [id]
    );
    
    if (musicResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Music not found' });
    }
    
    const { file_path, lyric_path } = musicResult.rows[0];
    
    // Delete from database (CASCADE will handle related tables)
    await client.query('DELETE FROM musics WHERE id = $1', [id]);
    
    await client.query('COMMIT');
    
    // Delete physical music file
    if (file_path) {
      const musicFilePath = path.join('/musicFiles', path.basename(file_path));
      if (fs.existsSync(musicFilePath)) {
        try {
          fs.unlinkSync(musicFilePath);
          console.log('Deleted music file:', musicFilePath);
        } catch (err) {
          console.error('Error deleting music file:', err);
          // Don't fail the request if file deletion fails
        }
      }
    }
    
    // Delete physical lyric file
    if (lyric_path) {
      const lyricFilePath = path.join('/lyrics', path.basename(lyric_path));
      if (fs.existsSync(lyricFilePath)) {
        try {
          fs.unlinkSync(lyricFilePath);
          console.log('Deleted lyric file:', lyricFilePath);
        } catch (err) {
          console.error('Error deleting lyric file:', err);
          // Don't fail the request if file deletion fails
        }
      }
    }
    
    res.json({ 
      message: 'Music deleted successfully',
      deleted_music_file: file_path,
      deleted_lyric_file: lyric_path
    });
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Delete error:', err);
    res.status(500).json({ error: 'Failed to delete music' });
  } finally {
    client.release();
  }
});

// ==================== ARTIST ENDPOINTS ====================

// Get all artists
app.get('/api/artists', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM artists ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get lists of songs by artist id
app.get('/api/artist/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        m.id,
        m.title,
        m.file_path,
        m.lyric_path,
        m.uploaded_at,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object('id', a.id, 'name', a.name))
          FILTER (WHERE a.id IS NOT NULL), '[]'
        ) AS artists,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object('id', g.id, 'name', g.name))
          FILTER (WHERE g.id IS NOT NULL), '[]'
        ) AS genres,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object('id', p.id, 'name', p.name))
          FILTER (WHERE p.id IS NOT NULL), '[]'
        ) AS playlists
      FROM musics m
      LEFT JOIN music_artists ma ON m.id = ma.music_id
      LEFT JOIN artists a ON ma.artist_id = a.id
      LEFT JOIN music_genres mg ON m.id = mg.music_id
      LEFT JOIN genres g ON mg.genre_id = g.id
      LEFT JOIN music_playlists mp ON m.id = mp.music_id
      LEFT JOIN playlists p ON mp.playlist_id = p.id
      WHERE ma.artist_id = $1
      GROUP BY m.id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No songs found for this artist' });
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});


// Create artist
app.post('/api/artists', async (req, res) => {
  try {
    const { name } = req.body;
    const result = await pool.query(
      'INSERT INTO artists (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Artist already exists' });
    }
    res.status(500).json({ error: 'Database error' });
  }
});

// Update artist
app.put('/api/artists/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const result = await pool.query(
      'UPDATE artists SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Artist not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete artist
app.delete('/api/artists/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM artists WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Artist not found' });
    }
    res.json({ message: 'Artist deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ==================== GENRE ENDPOINTS ====================

// Get all genres
app.get('/api/genres', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM genres ORDER BY name');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get genre by ID with their musics
app.get('/api/genre/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        m.id,
        m.title,
        m.file_path,
        m.lyric_path,
        m.uploaded_at,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object('id', a.id, 'name', a.name))
          FILTER (WHERE a.id IS NOT NULL), '[]'
        ) AS artists,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object('id', g.id, 'name', g.name))
          FILTER (WHERE g.id IS NOT NULL), '[]'
        ) AS genres,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object('id', p.id, 'name', p.name))
          FILTER (WHERE p.id IS NOT NULL), '[]'
        ) AS playlists
      FROM musics m
      LEFT JOIN music_artists ma ON m.id = ma.music_id
      LEFT JOIN artists a ON ma.artist_id = a.id
      LEFT JOIN music_genres mg ON m.id = mg.music_id
      LEFT JOIN genres g ON mg.genre_id = g.id
      LEFT JOIN music_playlists mp ON m.id = mp.music_id
      LEFT JOIN playlists p ON mp.playlist_id = p.id
      WHERE mg.genre_id = $1
      GROUP BY m.id
    `, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No songs found for this artist' });
    }

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Create genre
app.post('/api/genres', async (req, res) => {
  try {
    const { name } = req.body;
    const result = await pool.query(
      'INSERT INTO genres (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Genre already exists' });
    }
    res.status(500).json({ error: 'Database error' });
  }
});

// Update genre
app.put('/api/genres/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const result = await pool.query(
      'UPDATE genres SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Genre not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete genre
app.delete('/api/genres/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM genres WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Genre not found' });
    }
    res.json({ message: 'Genre deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// ==================== PLAYLIST ENDPOINTS ====================

// Get all playlists
app.get('/api/playlists', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        p.id, p.name,
        COUNT(mp.music_id) as music_count
      FROM playlists p
      LEFT JOIN music_playlists mp ON p.id = mp.playlist_id
      GROUP BY p.id
      ORDER BY p.name
    `);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Get musics by playlist id
app.get('/api/playlist/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT 
        m.id,
        m.title,
        m.file_path,
        m.lyric_path,
        m.uploaded_at,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object('id', a.id, 'name', a.name))
          FILTER (WHERE a.id IS NOT NULL), '[]'
        ) AS artists,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object('id', g.id, 'name', g.name))
          FILTER (WHERE g.id IS NOT NULL), '[]'
        ) AS genres,
        COALESCE(
          json_agg(DISTINCT jsonb_build_object('id', p.id, 'name', p.name))
          FILTER (WHERE p.id IS NOT NULL), '[]'
        ) AS playlists
      FROM musics m
      INNER JOIN music_playlists mp ON m.id = mp.music_id AND mp.playlist_id = $1
      LEFT JOIN playlists p ON mp.playlist_id = p.id
      LEFT JOIN music_artists ma ON m.id = ma.music_id
      LEFT JOIN artists a ON ma.artist_id = a.id
      LEFT JOIN music_genres mg ON m.id = mg.music_id
      LEFT JOIN genres g ON mg.genre_id = g.id
      GROUP BY m.id
    `, [id]);
    
    if (result.rows.length === 0) {
      return res.json({});
    }
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Create playlist
app.post('/api/playlists', async (req, res) => {
  try {
    const { name } = req.body;
    const result = await pool.query(
      'INSERT INTO playlists (name) VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    if (err.code === '23505') {
      return res.status(409).json({ error: 'Playlist already exists' });
    }
    res.status(500).json({ error: 'Database error' });
  }
});

// Update playlist
app.put('/api/playlists/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name } = req.body;
    const result = await pool.query(
      'UPDATE playlists SET name = $1 WHERE id = $2 RETURNING *',
      [name, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Playlist not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Delete playlist
app.delete('/api/playlists/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM playlists WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Playlist not found' });
    }
    res.json({ message: 'Playlist deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Add music to playlist
// Add music to playlist
app.post('/api/playlists/:id/musics', async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { music_id } = req.body;

    if (!music_id) {
      client.release();
      return res.status(400).json({ error: 'music_id is required' });
    }

    await client.query('BEGIN');

    // Ensure playlist exists
    const pl = await client.query('SELECT id FROM playlists WHERE id = $1', [id]);
    if (pl.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Playlist not found' });
    }

    // Ensure music exists
    const mus = await client.query('SELECT id, title FROM musics WHERE id = $1', [music_id]);
    if (mus.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Music not found' });
    }

    // Check if already present in playlist
    const exists = await client.query(
      'SELECT 1 FROM music_playlists WHERE music_id = $1 AND playlist_id = $2',
      [music_id, id]
    );
    if (exists.rows.length > 0) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Music already in playlist' });
    }

    await client.query(
      'INSERT INTO music_playlists (music_id, playlist_id) VALUES ($1, $2)',
      [music_id, id]
    );

    await client.query('COMMIT');

    res.status(201).json({ message: 'Music added to playlist', music: mus.rows[0], playlist_id: parseInt(id) });
  } catch (err) {
    try { await client.query('ROLLBACK'); } catch (e) {}
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  } finally {
    client.release();
  }
});

// Remove music from playlist
app.delete('/api/playlists/:id/musics/:musicId', async (req, res) => {
  try {
    const { id, musicId } = req.params;
    const result = await pool.query(
      'DELETE FROM music_playlists WHERE playlist_id = $1 AND music_id = $2 RETURNING *',
      [id, musicId]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Music not found in playlist' });
    }
    res.json({ message: 'Music removed from playlist' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File too large. Maximum size is 50MB.' });
    }
    return res.status(400).json({ error: err.message });
  }
  
  if (err.message === 'Invalid file type. Only audio files are allowed.') {
    return res.status(400).json({ error: err.message });
  }
  
  console.error(err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`Server running on port ${port}`);
});

// Add this endpoint to your backend/server.js to debug file serving issues

// Debug endpoint to check if music files exist
app.get('/api/debug/file/:filename', async (req, res) => {
  const { filename } = req.params;
  const musicDir = '/musicFiles';
  const fullPath = path.join(musicDir, filename);
  
  try {
    const exists = fs.existsSync(fullPath);
    const stats = exists ? fs.statSync(fullPath) : null;
    
    // List all files in directory
    const files = fs.readdirSync(musicDir);
    
    res.json({
      requested: filename,
      fullPath: fullPath,
      exists: exists,
      fileSize: stats ? stats.size : null,
      isFile: stats ? stats.isFile() : null,
      allFilesInDirectory: files.slice(0, 10), // First 10 files
      totalFiles: files.length,
      musicDirPath: musicDir
    });
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      requested: filename,
      fullPath: fullPath
    });
  }
});