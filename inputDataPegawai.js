const express = require('express');
const session = require('express-session');
const { Client, Pool, Result } = require('pg');
const multer = require('multer');
const path = require('path');
const {error} = require('console');
const app = express();


app.use(express.urlencoded({ extended: true }));

app.use (session({
    secret: 'kunci-rahasia-hris-sangan-aman',
    resave: false,
    saveUninitialized: false 
}));

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

function catatLog(username, role, aksi, keterangan) {
    const query = `INSERT INTO log_aktivitas (username, role, aksi, keterangan) VALUES ($1, $2, $3, $4)`;
    db.query(query, [username, role, aksi, keterangan], (err) => {
        if (err) console.log("Gagal merekam log:", err);
    });
}

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

app.get('/log-aktivitas', (req, res) => {
    if(req.session && req.session.roleUser === 'superadmin') {
        res.sendFile(__dirname + '/logAktivitas.html')
    } else {
        res.status(403).send("<h2>Akses Ditolak!</h2><p>Halaman Audit Trail ini khusus untuk Superadmin.</p><a href='/dashboard'>Kembali</a>");
    }
});

app.get('/api/log-aktivitas', (req, res) => {
    if (req.session && req.session.roleUser === 'superadmin') {
        const query = 'SELECT * FROM log_aktivitas ORDER BY waktu DESC LIMIT 100';

        db.query(query, (err, result) => {
            if (err) {
                console.log(err);
                res.status(500).json({error: "Gagal mengambil data log"});
            } else {
                res.json(result.rows);
            }
        });
    } else {
        res.status(403).json({error: "akses di tolak"})
    }
})

app.get('/dashboard.js', (req, res) => {
    res.sendFile(__dirname + '/dashboard.js');
});

app.get('/logAktivitas.js', (req, res) => {
    res.sendFile(__dirname + '/logAktivitas.js')
})

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
        if (req.session && req.session.userAktif) {
            catatLog(
                req.session.userAktif, 
                req.session.roleUser, 
                'UBAH STATUS', 
                `Mengubah status pegawai NIP ${nipPegawai} menjadi ${statusBaru}`
            );
        }

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
        if (Result.rows.length === 0) {
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
            req.session.userAktif = user;
            req.session.roleUser = Result.rows[0].role;

            console.log("Login berhasil untuk pengguna: ", req.session.roleUser);

            catatLog(
                user,
                Result.rows[0].role,
                'LOGIN',
                'Pengguna berhasil masuk kedalam sistem'
            )
            res.redirect('/dashboard');
        } else {
            console.log("percobaan login gagal.")
            res.send("Maaf username atau password salah. <br><br> <a href ='/'>kembali ke Login</a>");
        }
    });
});


app.get('/api/cek-role', (req, res) => {
    if (req.session && req.session.roleUser) {
        res.json({role: req.session.roleUser});
    } else {
        res.json({role: 'tamu'});
    }
});

app.post('/simpan', upload.single('foto_pegawai'), async (req, res) => {
    try {
        let nama = req.body.nama_pegawai;
        let umur = Number(req.body.umur_pegawai);
        let nip = Number(req.body.nip_pegawai);
        let cekNIP = await db.query("SELECT * FROM data_pegawai WHERE nip = $1", [nip]);
        if(cekNIP.rows.length > 0) {
            return res.send(`
                <script>
                    alert('GAGAL MENYIMPAN: NIP ${nip} sudah terdaftar di sistem! Silakan periksa kembali.');
                    window.location.href = '/dashboard';
                </script>
                `)
        }
        let nomor = Number(req.body.no_telepon);
        let email = req.body.email_pegawai;
        let status = req.body.status_pegawai;
        let tanggal_masuk = req.body.tanggal_masuk;
        let unitKerja = req.body.unit_kerja;
        let jabatan = req.body.jabatan;
        let pangkat = req.body.pangkat;
        let ruangan = req.body.ruangan;
        let jenisKepegawaian = req.body.jenis_kepegawaian;
        let foto = req.file ? req.file.filename : null;

        let perintahSQL = "INSERT INTO data_pegawai (nama, umur, nip, nomor, email, status, tanggal_masuk, unit_kerja, jabatan, pangkat, ruangan, jenis_kepegawaian, foto) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)";
        let isiData = [nama, umur, nip, nomor, email, status, tanggal_masuk, unitKerja, jabatan, pangkat, ruangan, jenisKepegawaian, foto];

        await db.query(perintahSQL, isiData);

        if (req.session && req.session.userAktif) {
            catatLog(
                req.session.userAktif, 
                req.session.roleUser, 
                'TAMBAH DATA', 
                `Menambahkan pegawai baru bernama ${nama} (NIP: ${nip})`
            );
        }

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

app.get('/api/pegawai/:nip', async (req, res) => {
    try {
        let nipTarget = req.params.nip;
        let hasil = await db.query("SELECT * FROM data_pegawai WHERE nip = $1", [nipTarget]);

        if (hasil.rows.length > 0) {
            res.json(hasil.rows[0]);
        } else {
            res.status(404).send("pegawai tidak ditemukan");
        }   
    } catch(error) {
        console.log("Error saat ambil data pegawai:", error.message);
        res.status(500).send("Error database");
    }
});

app.post('/update-pegawai', async (req, res) => {
    try {

        let nipLama = req.body.nip_lama ? Number(req.body.nip_lama) : Number(req.body.nip_baru);
        let namaBaru = req.body.nama_baru;
        let nipBaru = Number(req.body.nip_baru);
        let umurBaru = Number(req.body.umur_baru);
        let nomorBaru = Number(req.body.nomor_baru);
        let emailbaru = req.body.email_baru;
        let unitBaru = req.body.unit_baru;
        let jabatanBaru = req.body.jabatan_baru;
        let pangkatBaru = req.body.pangkat_baru;
        let ruanganbaru = req.body.ruangan_baru;
        let jenisBaru = req.body.jenis_kepegawaian_baru;

        let perintahSQL = "UPDATE data_pegawai set nama=$1, nip=$2, umur=$3, nomor=$4, email=$5, unit_kerja=$6, jabatan=$7, pangkat=$8, ruangan=$9, jenis_kepegawaian=$10 WHERE nip=$11";
        let data = [namaBaru, nipBaru, umurBaru, nomorBaru, emailbaru, unitBaru, jabatanBaru, pangkatBaru, ruanganbaru, jenisBaru, nipLama]

        await db.query(perintahSQL, data);
        if (req.session && req.session.userAktif) {
            catatLog(
                req.session.userAktif, 
                req.session.roleUser, 
                'EDIT DATA', 
                `Memperbarui data profil untuk NIP ${nipLama}`
            );
        }
        res.redirect('/dashboard');
    } catch (error) {
        console.log("Error saat melakukan update data:", error.message);
        res.send("Maaf, gagal mengupdate data pegawai");
    }
});

app.get('/api/unit-kerja', async (req, res) => {
    try {
        let hasil = await db.query("SELECT * FROM unit_kerja ORDER BY nama_unit ASC");
        res.json(hasil.rows);
    } catch (error) {
        console.log("Error mengambil data master unit kerja:", error.message);
        res.status(500).send("Error database");
    }
});

app.post('/api/unit-kerja', async (req, res) =>{
    try{
        let namaUnit = req.body.nama_unit;
        await db.query("INSERT INTO unit_kerja (nama_unit) VALUES ($1)", [namaUnit]);
        res.redirect('/dashboard');

    } catch (error) {
        console.log("Error menambah unit kerja:", error.message);
        res.status(500).send("Gagal menambah Unit kerja");
    }
});

app.get('/api/jabatan', async (req, res) => {
    try {
        let hasil = await db.query("SELECT * FROM jabatan ORDER BY nama_jabatan ASC");
        res.json(hasil.rows);
    } catch (error) {
        console.log("Error mengambil data master jabatan:", error.message);
        res.status(500).send("Error database");
    }
});

app.post('/api/jabatan', async (req, res) =>{
    try{
        let namaJabatan = req.body.nama_jabatan;
        await db.query("INSERT INTO jabatan (nama_jabatan) VALUES ($1)", [namaJabatan]);
        res.redirect('/dashboard');

    } catch (error) {
        console.log("Error menambah jabatan:", error.message);
        res.status(500).send("Gagal menambah jabatan");
    }
});

app.get('/api/pangkat', async (req, res) => {
    try {
        let hasil = await db.query("SELECT * FROM pangkat ORDER BY nama_pangkat ASC");
        res.json(hasil.rows);
    } catch (error) {
        console.log("Error mengambil data master pangkat:", error.message);
        res.status(500).send("Error database");
    }
});

app.post('/api/pangkat', async (req, res) =>{
    try{
        let namaPangkat = req.body.nama_pangkatan;
        await db.query("INSERT INTO pangkat (nama_pangkatan) VALUES ($1)", [namaPangkat]);
        res.redirect('/dashboard');

    } catch (error) {
        console.log("Error menambah pangkat:", error.message);
        res.status(500).send("Gagal menambah pangkat");
    }
});

app.get('/api/jenis-kepegawaian', async (req, res) => {
    try {
        let hasil = await db.query("SELECT * FROM jenis_kepegawaian ORDER BY nama_jenis ASC");
        res.json(hasil.rows);
    } catch (error) {
        console.log("Error mengambil data master jenis kepegawaian:", error.message);
        res.status(500).send("Error database");
    }
});

app.post('/api/jenis-kepegawaian', async (req, res) =>{
    try{
        let namaJenis = req.body.nama_jenis;
        await db.query("INSERT INTO jenis_kepegawaian (nama_jenis) VALUES ($1)", [namaJenis]);
        res.redirect('/dashboard');

    } catch (error) {
        console.log("Error menambah jenis kepegawaian:", error.message);
        res.status(500).send("Gagal menambah jenis kepegawaian");
    }
});

app.get('/export-pegawai/:status', async (req, res) => {
    try{
        let filterStatus = req.params.status;
        let sql = "";

        if(filterStatus === 'aktif') {
            sql ="SELECT * FROM data_pegawai WHERE status = 'Aktif' ORDER BY nama ASC";
        } else if (filterStatus === 'nonaktif') {
            sql ="SELECT * FROM data_pegawai WHERE status = 'Nonaktif' ORDER BY nama ASC";
        } else {
            sql ="SELECT * FROM data_pegawai ORDER BY nama ASC";
        }
        let hasil = await db.query(sql);
        let dataPegawai = hasil.rows;

        let isiCSV = "NIP; Nama Pegawai; Umur; No Telepon; Email; Tanggal Masuk; Unit Kerja; Jabatan; Pangkat; Ruangan; Status\n ";

        dataPegawai.forEach(p => {
            let tanggal = p.tanggal_masuk ? new Date(p.tanggal_masuk).toLocaleDateString('id-ID') : '-';
            let status = p.status_pegawai ? p.status_pegawai : 'Aktif';

            isiCSV += `"${p.nip}";"${p.nama}";"${p.umur}";"${p.nomor}";"${p.email}";"${tanggal}";"${p.unit_kerja || '-'}";"${p.jabatan || '-'}";"${p.pangkat || '-'}";"${p.ruangan || '-'}";"${status}"\n`
        });

        let namaFile = `Data_Pegawai_${filterStatus.toLocaleUpperCase()}.csv`;

        res.header('Content-Type', 'text/csv');
        res.attachment(namaFile);
        res.send(isiCSV);
    } catch (error) {
        console.log("Error export data:", error.message);
        res.status(500).send("Gagal mengexport data ke excel");
    }
});

app.get('/api/statistik-unit', async (req, res) => {
    try{
        let sql = "SELECT unit_kerja, COUNT(*) as jumlah FROM data_pegawai GROUP BY unit_kerja ORDER BY jumlah DESC";
        let hasil = await db.query(sql);
        res.json(hasil.rows);
    } catch (error) {
        console.log("Error statistik unit kerja:", error.message);
        res.status(500).send("Error database");
    }
});

app.get('/api/statistik-jabatan', async (req, res) => {
    try {
        let sql = "SELECT jabatan, COUNT(*) as jumlah FROM data_pegawai GROUP BY jabatan ORDER BY jumlah DESC";
        let hasil = await db.query(sql);
        res.json(hasil.rows);
    } catch (error) {
        console.log("Error Statistik jabatan:", error.message);
        res.status(500).send("Error database");
    }
})

app.listen(4001, () => {
    console.log("--> WEB MENYALA! Buka Chrome dan ketik: http://localhost:4001");
});