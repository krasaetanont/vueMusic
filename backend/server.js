import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';
import multer from 'multer';

dotenv.config();

const app = express();
const PORT = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create musicFiles directory if it doesn't exist
const musicFilesDir = '/musicFiles';
const lyricsDir = '/lyrics';

if (!fs.existsSync(musicFilesDir)) {
  fs.mkdirSync(musicFilesDir, { recursive: true });
}

if (!fs.existsSync(lyricsDir)) {
  fs.mkdirSync(lyricsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, musicFilesDir);
  },
  filename: function (req, file, cb) {
    // Sanitize filename
    const sanitizedTitle = req.body.title.replace(/[^a-z0-9]/gi, '_');
    const sanitizedArtist = req.body.artist.replace(/[^a-z0-9]/gi, '_');
    const ext = path.extname(file.originalname);
    cb(null, `${sanitizedTitle}-${sanitizedArtist}${ext}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  },
  fileFilter: function (req, file, cb) {
    // Accept audio files only
    if (!file.mimetype.startsWith('audio/')) {
      return cb(new Error('Only audio files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Enable CORS
app.use(cors());
app.use(express.json());
app.use('/api/musicFiles', express.static(musicFilesDir));
app.use('/api/lyrics', express.static(lyricsDir));

// Get all users
app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Get all music files
app.get('/api/musicFiles', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM songs ORDER BY uploaded_at DESC');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching music files:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

// Upload music file
app.post('/api/upload', upload.single('musicFile'), async (req, res) => {
  try {
    const { title, artist, genre } = req.body;
    
    // Validate required fields
    if (!title || !artist || !genre) {
      // Delete uploaded file if validation fails
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      return res.status(400).json({ error: 'Title, artist, and genre are required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Construct file paths
    const filePath = `/musicFiles/${req.file.filename}`;
    const lyricsPath = `/lyrics/${path.parse(req.file.filename).name}.html`;

    // Insert into database
    const [result] = await pool.query(
      'INSERT INTO songs (title, artist, genre, file_path, lyric_path) VALUES (?, ?, ?, ?, ?)',
      [title, artist, genre, filePath, lyricsPath]
    );

    res.status(201).json({ 
      id: result.insertId, 
      title, 
      artist, 
      genre,
      file_path: filePath,
      lyric_path: lyricsPath,
      message: 'Upload successful'
    });

  } catch (err) {
    console.error('Error uploading music file:', err);
    
    // Clean up uploaded file on error
    if (req.file) {
      try {
        fs.unlinkSync(req.file.path);
      } catch (unlinkErr) {
        console.error('Error deleting file:', unlinkErr);
      }
    }
    
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Error handling middleware for multer
app.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ error: 'File is too large. Maximum size is 50MB.' });
    }
    return res.status(400).json({ error: error.message });
  }
  
  if (error) {
    return res.status(400).json({ error: error.message });
  }
  
  next();
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});