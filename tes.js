const readline = require('readline/promises').createInterface({
    input: process.stdin,
    output: process.stdout
});

async function sistemPasien() {
    console.log("==Sistem Input Data Pasien==");

    let nama = await readline.question("Masukan Nama Pegawai: ");

    let umurTeks = await readline.question("Masukan Umur Pegawai: ");
    let Umur = Number(umurTeks);

    let kategory = "";

    if (Umur < 5) {
        kategory = "batita";
    }else if (Umur > 5, Umur <= 16) {
        kategory = "anak anak";
    }else if  (Umur > 16, Umur < 60) {
        kategory = "dewasa";
    }else {
        kategory = "lansia";
    }

    console.log("\n---REKAP DATA---");
    console.log("Nama: ", nama);
    console.log("umur: ", Umur);
    console.log("kategori: ", kategory);

    readline.close();

}

sistemPasien();