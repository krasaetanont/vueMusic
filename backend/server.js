import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./db.js";

dotenv.config();

const app = express();
const PORT = 3000;


// Enable CORS so frontend (5173) can call backend
app.use(cors());
app.use(express.json());
app.use('/api/music', express.static('/musicFiles'));
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