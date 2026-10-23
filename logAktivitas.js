function muatLog() {
    fetch('/api/log-aktivitas')
    .then(respon => respon.json())
    .then(data => {
        const wadah = document.getElementById('wadah-tabel-log');
        wadah.innerHTML = ''; 

        if (data.length === 0) {
            wadah.innerHTML = "<tr><td colspan='5' style='text-align: center; padding: 20px;'>Belum ada data aktivitas yang direkam.</td></tr>";
        } else {
            data.forEach(log => {
                let waktuFormat = new Date(log.waktu).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
                
                wadah.innerHTML += `
                    <tr>
                        <td>${waktuFormat}</td>
                        <td>${log.username}</td>
                        <td>${log.role}</td>
                        <td><span style="background-color: #17a2b8; color: white; padding: 3px 8px; border-radius: 4px; font-size: 12px; font-weight: bold; text-transform: uppercase;">${log.aksi}</span></td>
                        <td>${log.keterangan}</td>
                    </tr>
                `;
            });
        }
    })
    .catch(error => console.log("Gagal memuat log:", error));
}

muatLog();
