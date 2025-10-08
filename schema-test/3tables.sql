-- Table 1: Mahasiswa
CREATE TABLE mahasiswa (
    id SERIAL PRIMARY KEY,
    nim VARCHAR(20) NOT NULL UNIQUE,
    nama VARCHAR(100) NOT NULL,
    jurusan VARCHAR(100),
    angkatan INT,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 2: Mata Kuliah
CREATE TABLE matakuliah (
    id SERIAL PRIMARY KEY,
    kode_mk VARCHAR(20) NOT NULL UNIQUE,
    nama_mk VARCHAR(100) NOT NULL,
    sks INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 3: Nilai (relation table)
CREATE TABLE nilai (
    id SERIAL PRIMARY KEY,
    mahasiswa_id INT NOT NULL,
    matakuliah_id INT NOT NULL,
    nilai CHAR(2),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Foreign keys
    CONSTRAINT fk_mahasiswa
        FOREIGN KEY (mahasiswa_id)
        REFERENCES mahasiswa (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_matakuliah
        FOREIGN KEY (matakuliah_id)
        REFERENCES matakuliah (id)
        ON DELETE CASCADE
);
