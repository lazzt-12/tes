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
                tombol.innerText ='TUTUP TAABEL';
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
            
            if (kategori === 'baru') {
                urlTujuan = '/api/pegawai-baru';
            } else if (kategori === 'lama') {
                urlTujuan = '/api/pegawai-lama';
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
                                    <td>
                                        <span style="background-color: ${warnaStatus}; color: white; padding: 5px 10 px; border-radius: 4px; font-size: 12px; font-weight: bold;"> 
                                        ${teksStatus}
                                        </span>
                                        <button onclick="ubahStatus('${pegawai.nip}', '${teksStatus}')" style="margin-left: 5px; padding: 3px 6px; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; background-color: #f8f9fa;">
                                        UBAH STATUS
                                        </button>
                                        <button onclick="bukaFormEdit('${pegawai.nip}')" style="margin-left: 5px; padding: 3px 6px; border: 1px solid #ccc; border-radius: 4px; cursor: pointer; background-color: #ffc107;" title="Edit Data">
                                        EDIT DATA PEGAWAI
                                        </button>
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

        ambilTotalSemuaPegawai(); 
        tarikDataPegawai('baru');
        muatMasterUnitKerja();

        
        