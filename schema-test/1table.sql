CREATE TABLE mahasiswa (
    id SERIAL PRIMARY KEY,
    nim VARCHAR(20) NOT NULL UNIQUE,  
    nama VARCHAR(100) NOT NULL,
    jurusan VARCHAR(100),
    angkatan INT,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
