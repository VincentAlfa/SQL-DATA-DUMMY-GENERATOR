-- Table 1: Jurusan
CREATE TABLE jurusan (
    id SERIAL PRIMARY KEY,
    nama_jurusan VARCHAR(100) NOT NULL,
    fakultas VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 2: Mahasiswa
CREATE TABLE mahasiswa (
    id SERIAL PRIMARY KEY,
    nim VARCHAR(20) NOT NULL UNIQUE,
    nama VARCHAR(100) NOT NULL,
    jurusan_id INT NOT NULL,
    angkatan INT,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign key: relation to jurusan
    CONSTRAINT fk_jurusan
        FOREIGN KEY (jurusan_id)
        REFERENCES jurusan (id)
        ON DELETE CASCADE
);
