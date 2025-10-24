CREATE TABLE musics (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL UNIQUE,
    file_path VARCHAR(500) NOT NULL,
    lyric_path VARCHAR(500),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE artists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE genres (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE playlists (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

-- Linking tables (many-to-many)
CREATE TABLE music_artists (
    music_id INT REFERENCES musics(id) ON DELETE CASCADE,
    artist_id INT REFERENCES artists(id) ON DELETE CASCADE,
    PRIMARY KEY (music_id, artist_id)
);

CREATE TABLE music_genres (
    music_id INT REFERENCES musics(id) ON DELETE CASCADE,
    genre_id INT REFERENCES genres(id) ON DELETE CASCADE,
    PRIMARY KEY (music_id, genre_id)
);

CREATE TABLE music_playlists (
    music_id INT REFERENCES musics(id) ON DELETE CASCADE,
    playlist_id INT REFERENCES playlists(id) ON DELETE CASCADE,
    PRIMARY KEY (music_id, playlist_id)
);
