function hitungSoftCover() {
  const halaman = parseInt(document.getElementById('softcover-halaman').value);
  const panjang = parseFloat(document.getElementById('softcover-panjang').value);
  const lebar = parseFloat(document.getElementById('softcover-lebar').value);
  const cetak = parseInt(document.getElementById('softcover-cetak').value);
  const sisiIsi = document.getElementById('softcover-sisi-isi').value;
  const bahanIsi = document.getElementById('softcover-bahan-isi').value;

  if (!halaman || !panjang || !lebar || !cetak || !sisiIsi || !bahanIsi) {
    showAlert('Lengkapi semua input Soft Cover.');
    return;
  }

  const panjangCetak = panjang + 0.4;
  const lebarCetak = lebar + 0.4;

  const acuanPanjang = 47.4;
  const acuanLebar = 31.4;

  const fit1 = Math.floor(acuanPanjang / panjangCetak) * Math.floor(acuanLebar / lebarCetak);
  const fit2 = Math.floor(acuanPanjang / lebarCetak) * Math.floor(acuanLebar / panjangCetak);
  const totalA3 = Math.max(fit1, fit2);

  document.getElementById('softcover-totalA3').value = totalA3 > 0 ? totalA3 + ' pcs' : '-';

  // Halaman isi
  let halamanIsi = sisiIsi === "2" ? Math.ceil(halaman / 2) : halaman;
  if (sisiIsi === "2" && halamanIsi % 2 !== 0) halamanIsi += 1;

  const totalIsi = halamanIsi * cetak;
  const lembarIsi = Math.ceil(totalIsi / totalA3);
  document.getElementById('softcover-lembar-isi').value = lembarIsi + ' Lembar';

  const ketebalanBahan = {
    "BOOK PAPER": 0.0125,
    "HVS 75 gsm": 0.0093,
    "HVS 80 gsm": 0.01041,
    "HVS 100 gsm": 0.01234,
    "AP 120 gsm": 0.013,
    "AP 150 gsm": 0.0142,
    "MP 120 gsm": 0.0131,
    "MP 150 gsm": 0.0142,
    "AC 210 gsm": 0.023,
    "AC 230 gsm": 0.025,
    "AC 260 gsm": 0.03125,
    "AC 310 gsm": 0.036,
    "AC 400 gsm": 0.05
  };

  const ketebalan = ketebalanBahan[bahanIsi] || 0;
  const totalPunggung = halamanIsi * ketebalan;
  document.getElementById('softcover-punggung').value = totalPunggung.toFixed(2) + ' cm';
}

function resetSoftcoverForm() {
  const ids = [
    'softcover-halaman', 'softcover-panjang', 'softcover-lebar', 'softcover-cetak',
    'softcover-sisi-isi', 'softcover-bahan-isi',
    'softcover-totalA3', 'softcover-lembar-isi', 'softcover-punggung'
  ];

  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = (el.tagName === 'SELECT') ? el.options[0].value : '';
  });
}
