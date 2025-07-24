(function initSoftcoverForm() {
  const presetDropdown = document.getElementById('preset-ukuran');
  if (!presetDropdown) return;

  const customSizeRow = document.getElementById('custom-size-row');
  const previewOrientasi = document.getElementById('preview-orientasi');

  const presetUkuran = {
    "": null,
    "A3": { panjang: 42, lebar: 29.7 },
    "A4": { panjang: 29.7, lebar: 21 },
    "A5": { panjang: 21, lebar: 14.8 },
    "A6": { panjang: 14.8, lebar: 10.5 },
    "A7": { panjang: 10.5, lebar: 7.4 },
    "custom": "custom"
  };

  presetDropdown.addEventListener('change', () => {
    const selected = presetDropdown.value;
    const size = presetUkuran[selected];
    const panjangInput = document.getElementById('softcover-panjang');
    const lebarInput = document.getElementById('softcover-lebar');

    if (size === "custom") {
      customSizeRow.classList.remove('hidden');
      panjangInput.value = '';
      lebarInput.value = '';
      previewOrientasi.innerText = 'Orientasi: -';
    } else {
      customSizeRow.classList.add('hidden');
      if (size) {
        panjangInput.value = size.panjang;
        lebarInput.value = size.lebar;
        previewOrientasi.innerText = size.panjang >= size.lebar ? 'Orientasi: Portrait' : 'Orientasi: Landscape';
      } else {
        panjangInput.value = '';
        lebarInput.value = '';
        previewOrientasi.innerText = 'Orientasi: -';
      }
    }
  });

  ['softcover-panjang', 'softcover-lebar'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
      const panjang = parseFloat(document.getElementById('softcover-panjang').value);
      const lebar = parseFloat(document.getElementById('softcover-lebar').value);
      if (panjang && lebar) {
        previewOrientasi.innerText = panjang >= lebar ? 'Orientasi: Portrait' : 'Orientasi: Landscape';
      } else {
        previewOrientasi.innerText = 'Orientasi: -';
      }
    });
  });
})();

// Fungsi hitung Soft Cover
function hitungSoftCover() {
  const halaman = parseInt(document.getElementById('softcover-halaman').value);
  const panjang = parseFloat(document.getElementById('softcover-panjang').value);
  const lebar = parseFloat(document.getElementById('softcover-lebar').value);
  const cetak = parseInt(document.getElementById('softcover-cetak').value);
  const sisiIsi = document.getElementById('softcover-sisi-isi').value;
  const bahanIsi = document.getElementById('softcover-bahan-isi').value;
  const mediaCetak = document.getElementById('softcover-media-cetak').value;

  if (!halaman || !panjang || !lebar || !cetak || !sisiIsi || !bahanIsi) {
    showAlertModal('Lengkapi semua input Soft Cover.');
    return;
  }

const labelTotalA3 = document.getElementById('label-totalA3');

if (mediaCetak === "A3+") {
  acuanPanjang = 47.5;
  acuanLebar = 31.5;
  labelTotalA3.innerText = 'Total dalam 1 A3+:';
} else if (mediaCetak === "A3") {
  acuanPanjang = 42;
  acuanLebar = 29.7;
  labelTotalA3.innerText = 'Total dalam 1 A3:';
} else if (mediaCetak === "A4") {
  acuanPanjang = 29.7;
  acuanLebar = 21;
  labelTotalA3.innerText = 'Total dalam 1 A4:';
} else {
  showAlertModal('Pilih media cetak yang valid.');
  return;
}

  let panjangCetak, lebarCetak;
  if (mediaCetak === "A3+") {
    panjangCetak = panjang + 0.4;
    lebarCetak = lebar + 0.4;
  } else {
    panjangCetak = panjang;
    lebarCetak = lebar;
  }

  const ketebalanBahan = {
    "BOOK PAPER": 0.0120,
    "HVS 75 gsm": 0.0093,
    "HVS 80 gsm": 0.01041,
    "HVS 100 gsm": 0.01266,
    "AP 120 gsm": 0.01052,
    "AP 150 gsm": 0.0142,
    "MP 120 gsm": 0.01052,
    "MP 150 gsm": 0.0142,
    "AC 210 gsm": 0.023,
    "AC 230 gsm": 0.025,
    "AC 260 gsm": 0.03125,
    "AC 310 gsm": 0.036,
    "AC 400 gsm": 0.05
  };

  if (!(bahanIsi in ketebalanBahan)) {
    showAlertModal('Ketebalan bahan isi tidak ditemukan. Mohon pilih bahan yang valid.');
    return;
  }

  const ketebalan = ketebalanBahan[bahanIsi];

  const muatNormal = acuanPanjang >= panjangCetak && acuanLebar >= lebarCetak;
  const muatRotasi = acuanPanjang >= lebarCetak && acuanLebar >= panjangCetak;

  if (!muatNormal && !muatRotasi) {
    showAlertModal('Ukuran jadi melebihi ukuran media cetak. Harap periksa kembali!');
    return;
  }

  const fit1 = Math.floor(acuanPanjang / panjangCetak) * Math.floor(acuanLebar / lebarCetak);
  const fit2 = Math.floor(acuanPanjang / lebarCetak) * Math.floor(acuanLebar / panjangCetak);
  const totalA3 = Math.max(fit1, fit2);
  if (totalA3 <= 0) {
  showAlertModal('Ukuran jadi melebihi ukuran media cetak. Harap periksa kembali!');
  return;
  }
  document.getElementById('softcover-totalA3').value = totalA3 + ' pcs';

let totalIsi = 0;

if (sisiIsi === "1") {
  totalIsi = halaman * cetak;
} else if (sisiIsi === "2") {
  const lembarFisik = Math.ceil(halaman / 2);
  totalIsi = lembarFisik * cetak;
} else {
  showAlertModal('Pilih opsi sisi cetak isi yang valid.');
  return;
}

const lembarIsi = Math.ceil(totalIsi / totalA3);
document.getElementById('softcover-lembar-isi').value = lembarIsi + ' Lembar';

const lembarFisik = sisiIsi === "2" ? (halaman / 2) : halaman;
const totalPunggung = lembarFisik * ketebalan;
document.getElementById('softcover-punggung').value = totalPunggung.toFixed(2) + ' cm';

document.getElementById('output-softcover').classList.remove('hidden');
}


// Fungsi reset form Soft Cover
function resetSoftcoverForm() {
  const ids = [
    'softcover-halaman', 'softcover-panjang', 'softcover-lebar', 'softcover-cetak',
    'softcover-sisi-isi', 'softcover-bahan-isi', 'softcover-media-cetak',
    'softcover-totalA3', 'softcover-lembar-isi', 'softcover-punggung'
  ];

  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = (el.tagName === 'SELECT') ? el.options[0].value : '';
  });

  document.getElementById('preset-ukuran').selectedIndex = 0;
  document.getElementById('preview-orientasi').innerText = 'Orientasi: -';
  document.getElementById('custom-size-row').classList.add('hidden');
  document.getElementById('output-softcover').classList.add('hidden');
}

// Modal global alert
function showAlertModal(pesan) {
  const modal = document.getElementById("modal-alert");
  const message = document.getElementById("modal-alert-message");
  modal.classList.remove("hidden");
  message.textContent = pesan;
}

document.getElementById('modal-alert-close')?.addEventListener('click', () => {
  document.getElementById("modal-alert").classList.add("hidden");
});

document.addEventListener('keydown', (e) => {
  const modal = document.getElementById("modal-alert");
  if (!modal.classList.contains('hidden') && (e.key === 'Enter' || e.key === 'Escape')) {
    modal.classList.add("hidden");
  }
});
