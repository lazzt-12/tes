let rolePengguna = 'user';

function cekHakAkses() {
    fetch('/api/cek-role')
    .then(respon => respon.json())
    .then(data => {
        rolePengguna = data.role;

        let tombolForm = document.getElementById('tombol-form');
        let tombolKelolaAdmin = document.getElementById('tombol-kelola-admin');
        let areaExport = document.getElementById('area-export');
        let areaImport = document.getElementById('area-import');
        let areaPdf = document.getElementById('area-pdf');
        if (rolePengguna === 'admin_pegawai') {
            if (tombolKelolaAdmin) tombolKelolaAdmin.style.display ='none';
        }

        else if(rolePengguna === 'operator') {
            if (tombolKelolaAdmin) tombolKelolaAdmin.style.display = 'none';
            if (tombolForm) tombolForm.style.display = 'none';
            bukaSlide('tabel');
        }

        else if (rolePengguna === 'user') {
            if (tombolKelolaAdmin) tombolKelolaAdmin.style.display = 'none';
            if (tombolForm) tombolForm.style.display = 'none';
            if(areaExport) areaExport.style.display = 'none';
            if(areaImport) areaImport.style.display = 'none';
            if(areaPdf) areaPdf.style.display = 'none';
            bukaSlide('tabel');
        }
        tarikDataPegawai('baru');
    })
    .catch(error => console.log("Gagal cek role:", error));
}


function bukaSlide(target) {
            let form = document.getElementById('slide-form');
            let tabel = document.getElementById('slide-tabel');
            let tombolForm = document.getElementById('tombol-form');
            let tombolTabel = document.getElementById('tombol-tabel');

            if (target === 'form') {
                form.style.display = 'block';
                tabel.style.display = 'none';
                tombolForm.classList.add('aktif');
                tombolTabel.classList.remove('aktif');
            }
            else if (target === 'tabel') {
                form.style.display = 'none';
                tabel.style.display = 'block';
                tombolForm.classList.remove('aktif');
                tombolTabel.classList.add('aktif');
            }
            
        }

        function bukaTabelPegawai() {
            let tabel = document.getElementById('area-tabel-pegawai');
            let tombol = document.getElementById('tombol-selengkapnya');

            if(tabel.style.display === 'none' || tabel.style.display === ''){
                tabel.style.display ='block';
                tombol.innerText ='TUTUP TABEL';
                tombol.style.backgroundColor ='#dc3545';
            } else {
                tabel.style.display = 'none';
                tombol.innerText ='BUKA TABEL';
                tombol.style.backgroundColor = '#17a2b8';
            }
        }

        function ambilTotalSemuaPegawai() {
            fetch('/api/total-pegawai')
                .then(respon => respon.json())
                .then(data => {
                    
                    document.getElementById('teks-angka-total').innerText = data.total;
                    document.getElementById('teks-angka-aktif').innerText = data.aktif;
                    document.getElementById('teks-angka-nonaktif').innerText = data.nonaktif;
                })
                .catch(error => console.log("Gagal memuat total:", error));
        }

        function tarikDataPegawai(kategori) {
            let urlTujuan = '';
            
            if (kategori === 'aktif') {
                urlTujuan = '/api/pegawai-aktif';
            } else if (kategori === 'nonaktif') {
                urlTujuan = '/api/pegawai-nonaktif';
            } else if (kategori === 'semua') {
                urlTujuan = '/api/semua-pegawai'
            }

            fetch(urlTujuan)
                .then(respon => respon.json())
                .then(dataPegawai => {
                   document.getElementById('angka-tabel-aktif').innerText = dataPegawai.length 

                    const wadah = document.getElementById('wadah-tabel');
                    wadah.innerHTML = "";
            
                    if (dataPegawai.length === 0) {
                        wadah.innerHTML = "<tr><td colspan='11' style='text-align: center;'>Tidak ada data di kategori ini.</td></tr>";
                    } else {
                        dataPegawai.forEach(pegawai => {
                            let warnaStatus = pegawai.status === 'Aktif' ? '#28a745' : '#dc3545';
                            let teksStatus = pegawai.status ? pegawai.status : 'Aktif';
                            let teksTanggal = '-';
                            
                            if(pegawai.tanggal_masuk) {
                                let formatTanggal = new Date(pegawai.tanggal_masuk);
                                teksTanggal = formatTanggal.toLocaleDateString('id-ID', {
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric'
                                });
                            }
                            let tombolAksi = '';

                            if(rolePengguna === 'superadmin' || rolePengguna === 'admin_pegawai') {
                                tombolAksi = `
                                    <button onclick="ubahStatus('${pegawai.nip}', '${teksStatus}')" style="margin-left: 5px; padding: 3px 6px; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; background-color: #f8f9fa;">
                                        UBAH STATUS
                                    </button>
                                    <button onclick="bukaFormEdit('${pegawai.nip}')" style="margin-left: 5px; padding: 3px 6px; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; background-color: #ffc107;" title="Edit Data">
                                        EDIT DATA PEGAWAI
                                    </button>
                                    <button onclick="bukaRiwayat('${pegawai.nip}')" style="width: 100%; padding: 3px 6px; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; background-color: #17a2b8; color: white;" title="Lihat Riwayat">
                                        LIHAT RIWAYAT
                                    </button>
                                `;
                            }
                            wadah.innerHTML += `
                                <tr>
                                    <td>${pegawai.nip}</td>
                                    <td>${pegawai.nama}</td>
                                    <td>${pegawai.umur}</td>
                                    <td>${pegawai.nomor}</td>
                                    <td>${pegawai.email}</td>
                                    <td>${teksTanggal}</td>
                                    <td>${pegawai.unit_kerja ? pegawai.unit_kerja : '-'}</td>
                                    <td>${pegawai.jabatan ? pegawai.jabatan : '-'}</td>
                                    <td>${pegawai.pangkat ? pegawai.pangkat : '-'}</td>
                                    <td>${pegawai.ruangan ? pegawai.ruangan : '-'}</td>
                                    <td>${pegawai.jenis_kepegawaian ? pegawai.jenis_kepegawaian : '-'}</td>
                                    <td>
                                        <span style="background-color: ${warnaStatus}; color: white; padding: 5px 10 px; border-radius: 4px; font-size: 12px; font-weight: bold;"> 
                                        ${teksStatus}
                                        </span>
                                        ${tombolAksi}
                                    </td>
                                </tr>`;
                        });
                    }
                })
                .catch(error => console.log("Gagal memuat data:", error));
        }

        function cariPegawai() {
            let teksKetik = document.getElementById('input-pencarian').value.toLowerCase();
            let wadahTable = document.getElementById('wadah-tabel');
            let barisData = wadahTable.getElementsByTagName('tr');

            for(let i = 0; i <barisData.length; i++) {
                let isiBaris = barisData[i].innerText.toLowerCase();

                if(isiBaris.includes(teksKetik)) {
                    barisData[i].style.display = '';
                } else {
                    barisData[i].style.display = 'none';
                }
            }
        }

        function ubahStatus(nipTarget, statusSaatIni) {
            let statusBaru = statusSaatIni === 'Aktif' ? 'Nonaktif' : 'Aktif';

            let yakin = confirm("Apakah anda yakin ingin mengubah status" + nipTarget + "menjadi" + statusBaru + "?");

            if(yakin) {
                fetch('/api/ubah-status/' + nipTarget + '/' + statusBaru, {
                    method: 'PUT'
                })
                .then(respon => respon.text())
                .then(pesan => {
                    alert(pesan);
                    tarikDataPegawai('baru');
                })
                .catch(error => console.log("Gagal mengubah status:", error));
            } 
        }

        function tampilkanPreview(input) {
            let preview = document.getElementById('preview-gambar');
            let teks = document.getElementById('teks-preview');

            if (input.files && input.files[0]) {
                let reader = new FileReader();
                reader.onload = function(e) {
                    preview.src = e.target.result;
                    preview.style.display = 'block';
                    teks.style.display ='none';
                }
                reader.readAsDataURL(input.files[0])
            }
        }
        function bukaFormEdit(nipPegawai) {
            fetch('/api/pegawai/' + nipPegawai)
            .then(respon => respon.json())
            .then(data => {
                
                document.getElementById('edit-nip-lama').value = data.nip;
                
                document.getElementById('edit-nama').value = data.nama;
                document.getElementById('edit-nip').value = data.nip;
                document.getElementById('edit-umur').value = data.umur;
                document.getElementById('edit-nomor').value = data.nomor;
                document.getElementById('edit-email').value = data.email;
                
          
                if(data.unit_kerja) document.getElementById('edit-unit').value = data.unit_kerja;
                if(data.jabatan) document.getElementById('edit-jabatan').value = data.jabatan;
                
                
                document.getElementById('edit-pangkat').value = data.pangkat;
                document.getElementById('edit-ruangan').value = data.ruangan;
                if (data.jenis_kepegawaian) document.getElementById('edit-jenis').value = data.jenis_kepegawaian;
                
            document.getElementById('modal-edit').style.display = 'flex';
        })
        .catch(error => console.log("Gagal mengambil data pegawai:", error));
        }

        function muatMasterUnitKerja() {
            fetch('/api/unit-kerja') 
            .then(respon => respon.json())
            .then(daftarUnit => {
                let selectFormUtama = document.querySelector('select[name="unit_kerja"]');
                let selectFormEdit = document.getElementById('edit-unit');

                if (!selectFormUtama) return;

                let opsiHTML = `<option value="">-- Pilih Unit Kerja --</option>`;

                daftarUnit.forEach(unit => {
                    opsiHTML += `<option value="${unit.nama_unit.toLowerCase()}">${unit.nama_unit.toUpperCase()}</option>`;
                });

                selectFormUtama.innerHTML = opsiHTML;
                if(selectFormEdit) selectFormEdit.innerHTML =opsiHTML;
            })
            .catch(error => console.log("Gagal memuat unit kerja:", error));
        }
        function muatMasterUnitKerja() {
            fetch('/api/unit-kerja') 
            .then(respon => respon.json())
            .then(daftarUnit => {
                let selectFormUtama = document.querySelector('select[name="unit_kerja"]');
                let selectFormEdit = document.getElementById('edit-unit');

                if (!selectFormUtama) return;

                let opsiHTML = `<option value="">-- Pilih Unit Kerja --</option>`;

                daftarUnit.forEach(unit => {
                    opsiHTML += `<option value="${unit.nama_unit.toLowerCase()}">${unit.nama_unit.toUpperCase()}</option>`;
                });

                selectFormUtama.innerHTML = opsiHTML;
                if(selectFormEdit) selectFormEdit.innerHTML =opsiHTML;
            })
            .catch(error => console.log("Gagal memuat unit kerja:", error));
        }
        function muatMasterJabatan() {
            fetch('/api/jabatan') 
            .then(respon => respon.json())
            .then(daftarJabatan => {
                let selectFormUtama = document.querySelector('select[name="jabatan"]');
                let selectFormEdit = document.getElementById('edit-jabatan');

                if (!selectFormUtama) return;

                let opsiHTML = `<option value="">-- Pilih Jabatan --</option>`;

                daftarJabatan.forEach(jbtn => {
                    opsiHTML += `<option value="${jbtn.nama_jabatan.toLowerCase()}">${jbtn.nama_jabatan.toUpperCase()}</option>`;
                });

                selectFormUtama.innerHTML = opsiHTML;
                if(selectFormEdit) selectFormEdit.innerHTML =opsiHTML;
            })
            .catch(error => console.log("Gagal memuat jabatan:", error));
        }
        function muatMasterPangkat() {
            fetch('/api/pangkat') 
            .then(respon => respon.json())
            .then(daftarPangkat => {
                let selectFormUtama = document.querySelector('select[name="pangkat"]');
                let selectFormEdit = document.getElementById('edit-pangkat');

                if (!selectFormUtama) return;

                let opsiHTML = `<option value="">-- Pilih Pangkat --</option>`;

                daftarPangkat.forEach(pkt=> {
                    opsiHTML += `<option value="${pkt.nama_pangkat.toLowerCase()}">${pkt.nama_pangkat.toUpperCase()}</option>`;
                });

                selectFormUtama.innerHTML = opsiHTML;
                if(selectFormEdit) selectFormEdit.innerHTML =opsiHTML;
            })
            .catch(error => console.log("Gagal memuat pangkat:", error));
        }
        function muatMasterJenisKepegawian() {
            fetch('/api/jenis-kepegawaian') 
            .then(respon => respon.json())
            .then(daftarJenis => {
                let selectFormUtama = document.querySelector('select[name="jenis_kepegawaian"]');
                let selectFormEdit = document.getElementById('edit-jenis');

                if (!selectFormUtama) return;

                let opsiHTML = `<option value="">-- Pilih Jenis Kepegawaian --</option>`;

                daftarJenis.forEach(jns=> {
                    opsiHTML += `<option value="${jns.nama_jenis.toLowerCase()}">${jns.nama_jenis.toUpperCase()}</option>`;
                });

                selectFormUtama.innerHTML = opsiHTML;
                if(selectFormEdit) selectFormEdit.innerHTML =opsiHTML;
            })
            .catch(error => console.log("Gagal memuat jenis kepegawaian:", error));
        }

        function muatStatistikUnitKerja() {
            fetch('/api/statistik-unit')
            .then(respon => respon.json())
            .then(data => {
                let wadah = document.getElementById('wadah-statistik-unit');
                wadah.innerHTML ='';

                if (data.length === 0) {
                    wadah.innerHTML = '<p style="text-align: center; width: 100%;">Belum ada data pegawai.</p>';
                    return;
                }

                data.forEach(item => {
                    let namaUnit = item.unit_kerja ? item.unit_kerja.toUpperCase() : 'BELUM DITENTUKAN';

                    wadah.innerHTML += `
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #dee2e6; text-align: center;">
                    <h5 style="margin: 0 0 10px 0; color: #495057;">${namaUnit}</h5>
                    <p style="margin: 0; font-size: 24px; font-weight: bold; color: #17a2b8;">${item.jumlah} <span style="font-size: 14px; font-weight: normal; color: #6c757d;">Orang</span></p>
                </div>
                `;
                });
            })
            .catch(error => console.log("Gagal memuat statistik unit", error));
        }
        function muatStatistikJabatan() {
            fetch('/api/statistik-jabatan')
            .then(respon => respon.json())
            .then(data => {
                let wadah = document.getElementById('wadah-statistik-jabatan');
                wadah.innerHTML ='';

                if (data.length === 0) {
                    wadah.innerHTML = '<p style="text-align: center; width: 100%;">Belum ada data pegawai.</p>';
                    return;
                }

                data.forEach(item => {
                    let namaJabatan = item.jabatan ? item.jabatan.toUpperCase() : 'BELUM DITENTUKAN';

                    wadah.innerHTML += `
                <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; border: 1px solid #dee2e6; text-align: center;">
                    <h5 style="margin: 0 0 10px 0; color: #495057;">${namaJabatan}</h5>
                    <p style="margin: 0; font-size: 24px; font-weight: bold; color: #17a2b8;">${item.jumlah} <span style="font-size: 14px; font-weight: normal; color: #6c757d;">Orang</span></p>
                </div>
                `;
                });
            })
            .catch(error => console.log("Gagal memuat statistik jabtan", error));
        }
        function muatGrafikJabatan() {
            fetch('/api/statistik-jabatan')
            .then(respon => respon.json())
            .then(data => {
                let labelJabatan = data.map(item => item.jabatan ? item.jabatan.toUpperCase() : 'BELUM DITENTUKAN');
                let angkaJumlah = data.map(item => item.jumlah);

                let ctx = document.getElementById('grafikJabatan').getContext('2d');

                new Chart(ctx, {
                    type : 'bar',
                    data: {
                        labels: labelJabatan,
                        datasets:[{
                            label: 'Jumlah Pegawai',
                            data: angkaJumlah,
                            backgroundColor: [
                                '#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8', '#6f42c1'
                            ],
                            borderWidth: 1
                        }]
                    },
                    option: {
                        responsive: true,
                        scales: {
                            y: {beginAtZero: true}
                        }
                    }
                });
            })
            .catch(error => console.log("Gagal memuat Grafik:", error));
        }
        function muatGrafikUnit() {
            fetch('/api/statistik-unit')
            .then(respon => respon.json())
            .then(data => {
                let labelUnit = data.map(item => item.unit_kerja ? item.unit_kerja.toUpperCase() : 'BELUM DITENTUKAN');
                let angkaJumlah = data.map(item => item.jumlah);

                let ctx = document.getElementById('grafikUnit').getContext('2d');

                new Chart(ctx, {
                    type : 'bar',
                    data: {
                        labels: labelUnit,
                        datasets:[{
                            label: 'Jumlah Pegawai',
                            data: angkaJumlah,
                            backgroundColor: [
                                '#007bff', '#28a745', '#dc3545', '#ffc107', '#17a2b8', '#6f42c1'
                            ],
                            borderWidth: 1
                        }]
                    },
                    option: {
                        responsive: true,
                        scales: {
                            y: {beginAtZero: true}
                        }
                    }
                });
            })
            .catch(error => console.log("Gagal memuat Grafik:", error));
        }
        function bukaRiwayat(nipTarget) {
            document.getElementById('judul-nip-riwayat').innerText = nipTarget;
            document.getElementById('modal-riwayat').style.display = 'flex';
            
            fetch('/api/riwayat-pegawai/' + nipTarget)
            .then(respon => respon.json())
            .then(data => {
                const wadah = document.getElementById('wadah-tabel-riwayat');
                wadah.innerHTML = '';
                
                if (data.length === 0) {
                    wadah.innerHTML = "<tr><td colspan='3' style='text-align: center; padding: 15px;'>Belum ada riwayat perubahan untuk pegawai ini.</td></tr>";
                } else {
                    data.forEach(log => {
                        let waktuFormat = new Date(log.waktu).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
                        wadah.innerHTML += `
                            <tr>
                                <td style="padding: 10px; border: 1px solid #ddd;">${waktuFormat}</td>
                                <td style="padding: 10px; border: 1px solid #ddd;"><strong>${log.username}</strong><br><span style="font-size: 11px; color: #6c757d;">${log.role}</span></td>
                                <td style="padding: 10px; border: 1px solid #ddd;">${log.keterangan}</td>
                            </tr>
                        `;
                    });
                }
            })
            .catch(error => console.log("Gagal memuat riwayat pegawai:", error));
        }

        function cetakPDF() {
            window.print();
        }
        


        ambilTotalSemuaPegawai(); 
        //tarikDataPegawai('aktif');
        muatMasterUnitKerja();
        muatMasterJabatan();
        muatMasterPangkat();
        muatMasterJenisKepegawian();
        muatStatistikUnitKerja();
        muatStatistikJabatan();
        muatGrafikJabatan();
        muatGrafikUnit();
        cekHakAkses();
        tarikDataPegawai('semua');
        
        
        