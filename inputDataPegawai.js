const express = require('express');
const { Client } = require('pg');
const app = express();


app.use(express.urlencoded({ extended: true }));


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
    res.sendFile(__dirname +'/login.html')
});

app.get('/form-pegawai', (req, res) => {
    res.sendFile(__dirname + '/index.html')
});
app.post('/proses-login', (req, res) => {
    let user = req.body.usernameInput;
    let pass = req.body.passwordInput;

    if(user === "admin" && pass === "rahasia123" ) {
        res.redirect('/form-pegawai');
    }else{
        res.send(`
            <h2 style="color: red;">Username atau Password salah!</h2>
            <a href="/login">Kembali ke halaman login</a>`);
    }
});
app.post('/simpan', async (req, res) => {
    try {
        let nama = req.body.nama_pegawai;
        let umur = Number(req.body.umur_pegawai);
        let nip = Number(req.body.nip_pegawai);
        let nomor = Number(req.body.no_telepon);
        let email = req.body.email_pegawai;

        let perintahSQL = "INSERT INTO data_pegawai (nama, umur, nip, nomor, email) VALUES ($1, $2, $3, $4, $5)";
        let isiData = [nama, umur, nip, nomor, email];

        await db.query(perintahSQL, isiData);

        res.send(`
            <h2>Data berhasil disimpan ke PostgreSQL!</h2>
            <p>Nama: <b>${nama}</b></p>
            <p>Umur: <b>${umur}</b></p>
            <p>NIP: <b>${nip}</b></p>
            <p>Nomor: <b>${nomor}</b></p>
            <p>Email: <b>${email}</b></p>
            <br>
            <a href="/">[ Kembali Isi Data ]</a>
        `);
    } catch (error) {
        console.log("Terjadi error saat simpan:", error.message);
        res.send("Maaf, terjadi kesalahan sistem.");
    }
});

app.listen(4001, () => {
    console.log("--> WEB MENYALA! Buka Chrome dan ketik: http://localhost:4001");
});