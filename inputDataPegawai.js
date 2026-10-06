const express = require('express');
const { Client } = require('pg');
const app = express();

// Jembatan agar Express bisa membaca ketikan dari form HTML
app.use(express.urlencoded({ extended: true }));

// Koneksi ke Database PostgreSQL
const db = new Client({
    user: 'postgres',
    password: 'Aflaz7621_$', 
    host: 'localhost',
    port: 3000,              
    database: 'inputDataPegawai_db'
});

db.connect()
    .then(() => console.log("--> KONEKSI DATABASE SUKSES!"))
    .catch(err => console.error("--> GAGAL KONEK KE DATABASE:", err.message));

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/simpan', async (req, res) => {
    try {
        let nama = req.body.nama_pegawai;
        let umur = Number(req.body.umur_pegawai);

        let perintahSQL = "INSERT INTO data_pegawai (nama, umur) VALUES ($1, $2)";
        let isiData = [nama, umur];

        await db.query(perintahSQL, isiData);

        res.send(`
            <h2>Data berhasil disimpan ke PostgreSQL!</h2>
            <p>Nama: <b>${nama}</b></p>
            <p>Umur: <b>${umur}</b></p>
            <br>
            <a href="/">[ Kembali Isi Data ]</a>
        `);
    } catch (error) {
        console.log("Terjadi error saat simpan:", error.message);
        res.send("Maaf, terjadi kesalahan sistem.");
    }
});

app.listen(4000, () => {
    console.log("--> WEB MENYALA! Buka Chrome dan ketik: http://localhost:4000");
});