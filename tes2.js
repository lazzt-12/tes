const readline = require('readline/promises').createInterface({
    input: process.stdin,
    output: process.stdout
});

const { Client } = require('pg');

const db = new Client({
    user: 'postgres',
    password: 'Aflaz7621_$',
    host: 'localhost',
    port: 3000,
    database: 'bioskop_db'

});

async function cekTiket() {
    await db.connect();

    console.log("==Validasi Umur==");

    let Nama = await readline.question("Masukan Nama Anda: ");

    let umurTeks = await readline.question("Berapa Umur anda: ");
    let Umur= Number(umurTeks);

    let jumlahTiket = await readline.question("Berapa Jumlah tiket yang di beli: ");
    let jumlah = Number(jumlahTiket);

    let kategori = "";
    let harga = 0;



    if (Umur < 13) {
        kategori = "anak anak",
        harga = 50000;
    }else if (Umur < 18) {
        kategori = "Remaja"
        harga = 75000;
    }else {
        kategori = "dewasa"
        harga = 100000;
    }

    let totalHarga = harga * jumlah;

     console.log("\n---Validasi Umur---");
     console.log("Masukan Nama Anda: ", Nama);
     console.log("Berapa Umur Anda: ", Umur);
     console.log("kategori: ", kategori);
     console.log("harga satu tiket: ", harga);
     console.log("Berapa Jumlah Tiket Yang Dibeli: ", jumlah);
     console.log("total harga: ", totalHarga);

     console.log("\n menyimpan database...");

     let perintahSQL = "INSERT INTO penjualan_tiket (nama, umur, kategori, jumlah_tiket, total_harga) VALUES ($1, $2, $3, $4, $5)";
     let isiData = [Nama, Umur, kategori, jumlah, totalHarga];

     await db.query(perintahSQL, isiData);
     console.log("Data Berhasil di simpan ke postgreSQL")

    await db.end();
    readline.close();
}

cekTiket();