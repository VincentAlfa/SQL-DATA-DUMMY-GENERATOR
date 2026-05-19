-- Table 1: Mahasiswa
CREATE TABLE mahasiswa (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nim VARCHAR(20) NOT NULL UNIQUE,
    nama VARCHAR(100) NOT NULL,
    jurusan VARCHAR(100),
    angkatan INT,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 2: Dosen
CREATE TABLE dosen (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nip VARCHAR(20) NOT NULL UNIQUE,
    nama VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table 3: Mata Kuliah
CREATE TABLE matakuliah (
    id INT AUTO_INCREMENT PRIMARY KEY,
    kode_mk VARCHAR(20) NOT NULL UNIQUE,
    nama_mk VARCHAR(100) NOT NULL,
    sks INT NOT NULL,

    dosen_id INT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_dosen
        FOREIGN KEY (dosen_id)
        REFERENCES dosen(id)
        ON DELETE SET NULL
);

-- Table 4: Nilai
CREATE TABLE nilai (
    id INT AUTO_INCREMENT PRIMARY KEY,

    mahasiswa_id INT NOT NULL,
    matakuliah_id INT NOT NULL,

    nilai CHAR(2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_mahasiswa
        FOREIGN KEY (mahasiswa_id)
        REFERENCES mahasiswa(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_matakuliah
        FOREIGN KEY (matakuliah_id)
        REFERENCES matakuliah(id)
        ON DELETE CASCADE
);