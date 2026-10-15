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


app.get('/dashboard', (req, res) => {  
    res.sendFile(__dirname + '/dashboard.html')
});

app.get('/kelola-admin', (req, res) => {
    res.sendFile(__dirname + '/tambahAdmin.html')
});

app.get('/api/total-pegawai', async (req, res) => {
    try {
        let perintahSQL = "SELECT COUNT(*) as total FROM data_pegawai";
        let hasil = await db.query(perintahSQL);
        res.json({total: hasil.rows[0].total});
    } catch (error) {
        console.log("Error hitung total:", error.message);
        res.status(500).send("error database");
    }
});

app.get('/api/pegawai-baru', async (req, res) => {
    try {
        let perintahSQL = "select * from data_pegawai WHERE tanggal_masuk >= CURRENT_DATE - INTERVAL '1 YEAR'";
        let hasil = await db.query(perintahSQL)
        res.json(hasil.rows);
    } catch (error) {
        console.log("Eror saat mengambil data pegawai baru", error.message);
        res.status(500).send("error database")
    }
});
app.get('/api/pegawai-lama', async (req, res) => {
    try {
        let perintahSQL = "select * from data_pegawai WHERE tanggal_masuk < CURRENT_DATE - INTERVAL '1 YEAR'";
        let hasil = await db.query(perintahSQL)
        res.json(hasil.rows);
    } catch (error) {
        console.log("Eror saat mengambil data pegawai lama", error.message);
        res.status(500).send("error database")
    }
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
                
            
        });
    });
});
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
            res.redirect('/dashboard');
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

        res.redirect('/dashboard');
        
    } catch (error) {
        console.log("Terjadi error saat simpan:", error.message);
        res.send("Maaf, terjadi kesalahan sistem.");
    }
});

app.post('/kelola-admin', async (req, res) => {
    try {
        let userBaru = req.body.username_baru;
        let passBaru = req.body.password_baru;

        let perintahSQL = "insert into admin_login (username, password) values ($1, $2)";
        isiData = [userBaru, passBaru];

        db.query(perintahSQL, isiData);

        res.redirect('/dashboard');
    } catch (error) {
        console.log("Error tambah admin:", error.message);
        res.send("Maaf, terjadi kesalahan saat membuat akun baru.");
    }
});

app.listen(4001, () => {
    console.log("--> WEB MENYALA! Buka Chrome dan ketik: http://localhost:4001");
});