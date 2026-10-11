const express = require('express');
const { Client, Pool, Result } = require('pg');
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

app.get('/lupa-pass', (req, res) => {
    res.sendFile(__dirname + '/lupaPass.html');
});

app.get('/form-pegawai', (req, res) => {
    res.sendFile(__dirname + '/index.html')
});

app.post('/lupa-pass', (req, res) => {
    let user = req.body.usernameInput;
    let newPass = req.body.newPasswordInput;

    let sqlCek = "SELECT * FROM admin_login where username = $1";

    db.query(sqlCek, [user], (err, Result) => {

        if(err) return res.send("terjadi kesalahan database saat mengecek username");
        if (Result.rows.lengt === 0) {
            return res.send("Maaf username tidak ada <br><br> <a href='/lupa-pass'>Coba Lagi</a>");
        }

        let sqlUpdate = "UPDATE admin_login set password = $1 where username = $2";

        db.query(sqlUpdate, [newPass, user], (errUpdate, ResultUpdate) =>{
            if (errUpdate){
                res.send("gagal mengubah kata sandi");
            } else {
                console.log("Kata sandi untuk" + user + "Berhasil Diubah!");
                res.send("kata sandi berhasil di ubah <br><br> <a href='/'>Kembali ke Login</a>");
            }
                
            
        })
    })
})
app.post('/proses-login', (req, res) => {
    let user = req.body.usernameInput;
    let pass = req.body.passwordInput;

    let sql = "SELECT * FROM admin_login where username = $1 and password = $2";

    db.query(sql, [user, pass], (err, Result) => {
        if (err) {
            console.error("terjadi error database: ", err);
            return res.send("terjadi kesalahan pada server");
        }
        if (Result.rows.length > 0) {
            console.log("Login berhasil untuk pengguna: ", user);
            res.redirect('/form-pegawai');
        } else {
            console.log("percobaan login gagal.")
            res.send("Maaf username atau password salah. <br><br> <a href ='/'>kembali ke Login</a>");
        }
    });
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