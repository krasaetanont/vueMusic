import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js";
import path from "path";
import fs from "fs";
import { fileURLToPath } from 'url';

dotenv.config();

const app = express();
const PORT = 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


// Enable CORS so frontend (5173) can call backend
app.use(cors());
app.use(express.json());
app.use('/api/musicFiles', express.static('/musicFiles'));
app.use('/api/lyrics', express.static('/lyrics'));

app.get('/api/users', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching users:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.get('/api/musicFiles', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM songs');
    res.json(rows);
  } catch (err) {
    console.error('Error fetching music files:', err);
    res.status(500).json({ error: 'Internal Server Error' });
}});



app.post('/api/upload', async (req, res) => {
  const { title, artist, genre, fileContent } = req.body;
  const filePath = `/musicFiles/${req.body.title}-${req.body.artist}.mp3`;
  const lyricsPath = `/lyrics/${req.body.title}-${req.body.artist}.html`;
  try {
    fs.writeFile(`./musicFiles/${req.body.title}-${req.body.artist}.mp3`, fileContent, 'base64', (err) => {
      if (err) {
        console.error('Error saving music file:', err);
        return res.status(500).json({ error: 'Failed to save music file' });
      }
      res.json({ message: 'Music file uploaded successfully' });
    });
    const [result] = await pool.query(
      'INSERT INTO songs (title, artist, genre, file_path, lyric_path) VALUES (?, ?, ?, ?, ?)',
      [title, artist, genre, filePath, lyricsPath]
    );
    res.status(201).json({ id: result.insertId, title, artist, album, filePath, lyricsPath });
  } catch (err) {
    console.error('Error uploading music file:', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


// Test route
// app.get('/', (req, res) => {
//   res.json({ message: " Hello from Backend running and serving music files! checking for updates..." });
//   //backend won't update unless restarted
// });

// app.get('/test-db', async (req, res) => {
//   try {
//     const [rows] = await pool.query('SELECT NOW() AS time');
//     res.json({ success: true, time: rows[0].time });
//   } catch (err) {
//     console.error('DB connection error:', err);
//     res.status(500).json({ success: false, error: err.message });
//   }
// });