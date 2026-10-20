const express = require('express');
const { Client, Pool, Result } = require('pg');
const multer = require('multer');
const path = require('path');
const app = express();


app.use(express.urlencoded({ extended: true }));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage: storage });

app.use('/uploads', express.static('uploads'));

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

app.get('/dashboard.js', (req, res) => {
    res.sendFile(__dirname + '/dashboard.js');
});

app.get('/kelola-admin', (req, res) => {
    res.sendFile(__dirname + '/tambahAdmin.html')
});

app.get('/api/total-pegawai', async (req, res) => {
    try {
        let hasilTotal = await db.query("SELECT COUNT(*) as total FROM data_pegawai");
        let hasilAktif = await db.query("SELECT COUNT(*) as aktif FROM data_pegawai WHERE status = 'Aktif' OR status IS NULL");
        let hasilNonaktif = await db.query("SELECT COUNT(*) as nonaktif FROM data_pegawai WHERE status = 'Nonaktif'");

        res.json({
            total: hasilTotal.rows[0].total,
            aktif: hasilAktif.rows[0].aktif,
            nonaktif: hasilNonaktif.rows[0].nonaktif,

        });
    } catch (error) {
        console.log("Error hitung statistik:", error.message);
        res.status(500).send("Error database");
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

app.put('/api/ubah-status/:nip/:status_baru', async (req, res) => {
    let nipPegawai = req.params.nip;
    let statusBaru = req.params.status_baru;

    try {
        let perintahSQL = "UPDATE data_pegawai SET status = $1 WHERE nip = $2";

        await db.query(perintahSQL, [statusBaru, nipPegawai]);

        res.send("Status berhasil diubah menjadi " + statusBaru + "!");
    } catch (error) {
        console.log("Error ubah status: ", error.message);
        res.status(500).send("Gagal mengubah status di database.");
    }
})


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
app.post('/simpan', upload.single('foto_pegawai'), async (req, res) => {
    try {
        let nama = req.body.nama_pegawai;
        let umur = Number(req.body.umur_pegawai);
        let nip = Number(req.body.nip_pegawai);
        let nomor = Number(req.body.no_telepon);
        let email = req.body.email_pegawai;
        let status = req.body.status_pegawai;
        let tanggal_masuk = req.body.tanggal_masuk;
        let unitKerja = req.body.unit_kerja;
        let jabatan = req.body.jabatan;
        let pangkat = req.body.pangkat;
        let ruangan = req.body.ruangan;
        let foto = req.file ? req.file.filename : null;

        let perintahSQL = "INSERT INTO data_pegawai (nama, umur, nip, nomor, email, status, tanggal_masuk, unit_kerja, jabatan, pangkat, ruangan, foto) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)";
        let isiData = [nama, umur, nip, nomor, email, status, tanggal_masuk, unitKerja, jabatan, pangkat, ruangan, foto];

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