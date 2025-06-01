document.addEventListener('DOMContentLoaded', () => {
  const presetDropdown = document.getElementById('preset-ukuran');
  const customSizeRow = document.getElementById('custom-size-row');
  const previewOrientasi = document.getElementById('preview-orientasi');

  const presetUkuran = {
    "": null,
    "A3": { panjang: 29.7, lebar: 42 },
    "A4": { panjang: 21, lebar: 29.7 },
    "A5": { panjang: 14.8, lebar: 21 },
    "A6": { panjang: 10.5, lebar: 14.8 },
    "A7": { panjang: 7.4, lebar: 10.5 },
    "custom": "custom"
  };

  presetDropdown.addEventListener('change', () => {
    const selected = presetDropdown.value;
    const size = presetUkuran[selected];

    if (size === "custom") {
      customSizeRow.classList.remove('hidden');
      document.getElementById('softcover-panjang').value = '';
      document.getElementById('softcover-lebar').value = '';
      previewOrientasi.innerText = 'Orientasi: -';
    } else if (size) {
      customSizeRow.classList.add('hidden');
      document.getElementById('softcover-panjang').value = size.panjang;
      document.getElementById('softcover-lebar').value = size.lebar;
      previewOrientasi.innerText = size.panjang > size.lebar ? 'Orientasi: Landscape' : 'Orientasi: Portrait';
    } else {
      customSizeRow.classList.add('hidden');
      document.getElementById('softcover-panjang').value = '';
      document.getElementById('softcover-lebar').value = '';
      previewOrientasi.innerText = 'Orientasi: -';
    }
  });

  ['softcover-panjang', 'softcover-lebar'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
      const panjang = parseFloat(document.getElementById('softcover-panjang').value);
      const lebar = parseFloat(document.getElementById('softcover-lebar').value);
      if (panjang && lebar) {
        previewOrientasi.innerText = panjang > lebar ? 'Orientasi: Landscape' : 'Orientasi: Portrait';
      } else {
        previewOrientasi.innerText = 'Orientasi: -';
      }
    });
  });
});

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

  // Margin tambah 0.4 cm untuk panjang dan lebar cetak
  const panjangCetak = panjang + 0.4;
  const lebarCetak = lebar + 0.4;

  // Ukuran A3+ (dalam cm) sebagai acuan cetak
  const acuanPanjang = 47.4;
  const acuanLebar = 31.4;

  // Hitung muat berapa pcs di orientasi normal dan dibalik
  const fit1 = Math.floor(acuanPanjang / panjangCetak) * Math.floor(acuanLebar / lebarCetak);
  const fit2 = Math.floor(acuanPanjang / lebarCetak) * Math.floor(acuanLebar / panjangCetak);

  const totalA3 = Math.max(fit1, fit2);
  if (totalA3 <= 0) {
    showAlert('Ukuran buku terlalu besar, tidak muat di kertas A3+.');
    return;
  }

  document.getElementById('softcover-totalA3').value = totalA3 + ' pcs';

  // Hitung jumlah halaman isi cetak (bila 2 sisi, bagi 2, dibulatkan ke atas genap)
  let halamanIsi = sisiIsi === "2" ? Math.ceil(halaman / 2) : halaman;
  if (sisiIsi === "2" && halamanIsi % 2 !== 0) halamanIsi += 1;

  const totalIsi = halamanIsi * cetak;
  const lembarIsi = Math.ceil(totalIsi / totalA3);
  document.getElementById('softcover-lembar-isi').value = lembarIsi + ' Lembar';

  // Ketebalan bahan kertas (cm)
  const ketebalanBahan = {
    "BOOK PAPER": 0.0125,
    "HVS 75 gsm": 0.0093,
    "HVS 80 gsm": 0.01041,
    "HVS 100 gsm": 0.01234,
    "AP 120 gsm": 0.013,
    "AP 150 gsm": 0.0165,
    "MP 120 gsm": 0.015,
    "MP 150 gsm": 0.020,
    "AC 210 gsm": 0.027,
    "AC 230 gsm": 0.0285,
    "AC 260 gsm": 0.030,
    "AC 310 gsm": 0.034,
    "AC 400 gsm": 0.042
  };

  let ketebalan = ketebalanBahan[bahanIsi] || 0.0125;

  // Ketebalan punggung (cm), hitung lembar isi dibagi 2 (karena dua halaman dalam satu lembar) lalu dikali ketebalan kertas
  const ketebalanPunggung = (halaman / 2) * ketebalan;

  document.getElementById('softcover-punggung').value = ketebalanPunggung.toFixed(2) + ' cm';

  // Tampilkan hasil output
  document.getElementById('output-softcover').classList.remove('hidden');
}

function resetSoftcoverForm() {
  document.getElementById('softcover-halaman').value = '';
  document.getElementById('softcover-cetak').value = '';
  document.getElementById('preset-ukuran').value = '';
  document.getElementById('softcover-panjang').value = '';
  document.getElementById('softcover-lebar').value = '';
  document.getElementById('softcover-sisi-isi').value = '';
  document.getElementById('softcover-bahan-isi').value = '';
  document.getElementById('preview-orientasi').innerText = 'Orientasi: -';
  document.getElementById('output-softcover').classList.add('hidden');
  document.getElementById('custom-size-row').classList.add('hidden');
}

// Modal Alert (gunakan modal alert global dari halaman induk, fungsi ini dipanggil saja)
function showAlert(message) {
  if (window.showAlertModal) {
    window.showAlertModal(message);
  } else {
    alert(message);
  }
}
