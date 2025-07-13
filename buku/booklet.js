(function initBookletForm() {
  const presetDropdown = document.getElementById('preset-ukuran-booklet');
  if (!presetDropdown) return;

  const customSizeRow = document.getElementById('custom-size-row-booklet');
  const previewOrientasi = document.getElementById('preview-orientasi-booklet');

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
    const panjangInput = document.getElementById('booklet-panjang');
    const lebarInput = document.getElementById('booklet-lebar');

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

  ['booklet-panjang', 'booklet-lebar'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
      const panjang = parseFloat(document.getElementById('booklet-panjang').value);
      const lebar = parseFloat(document.getElementById('booklet-lebar').value);
      if (panjang && lebar) {
        previewOrientasi.innerText = panjang >= lebar ? 'Orientasi: Portrait' : 'Orientasi: Landscape';
      } else {
        previewOrientasi.innerText = 'Orientasi: -';
      }
    });
  });
})();

function hitungBooklet() {
  const halaman = parseInt(document.getElementById('booklet-halaman').value);
  const panjangJadi = parseFloat(document.getElementById('booklet-panjang').value);
  const lebarJadi = parseFloat(document.getElementById('booklet-lebar').value);
  const cetak = parseInt(document.getElementById('booklet-cetak').value);
  const bahanCover = document.getElementById('booklet-bahan-cover').value;
  const sisiCover = document.getElementById('booklet-sisi-cover').value;
  const mediaCover = document.getElementById('booklet-media-cover').value;
  const bahanIsi = document.getElementById('booklet-bahan-isi').value;
  const mediaIsi = document.getElementById('booklet-media-isi').value;

  if (!halaman || !panjangJadi || !lebarJadi || !cetak || !bahanCover || !sisiCover || !mediaCover || !bahanIsi || !mediaIsi) {
    showAlertModal('Lengkapi semua input Booklet.');
    return;
  }

  // LOCK spread: lebar * 2
  let spreadWidth = lebarJadi * 2;
  let spreadHeight = panjangJadi;

  // Bleed allowance kalau A3+
  let panjangCetak = spreadWidth;
  let lebarCetak = spreadHeight;

  if (mediaIsi === "A3+" || mediaIsi === "LONG-CUSTOM") {
    panjangCetak += 0.4;
    lebarCetak += 0.4;
  }

  // Acuan ukuran media
  let acuanPanjang, acuanLebar;
  if (mediaIsi === "A3+") {
    acuanPanjang = 47.5;
    acuanLebar = 31.5;
  } else if (mediaIsi === "A3") {
    acuanPanjang = 42;
    acuanLebar = 29.7;
  } else if (mediaIsi === "A4") {
    acuanPanjang = 29.7;
    acuanLebar = 21;
  } else if (mediaIsi === "LONG-CUSTOM") {
    acuanPanjang = 65;
    acuanLebar = 32.5;
  } else {
    showAlertModal('Pilih media cetak isi yang valid.');
    return;
  }

  // Hitung muat
  const fit1 = Math.floor(acuanPanjang / panjangCetak) * Math.floor(acuanLebar / lebarCetak);
  const fit2 = Math.floor(acuanPanjang / lebarCetak) * Math.floor(acuanLebar / panjangCetak);
  let totalDalam = Math.max(fit1, fit2);

  if (totalDalam <= 0 && fit1 > 0) {
    totalDalam = fit1;
  }
  if (totalDalam <= 0) {
    showAlertModal('Ukuran terbuka melebihi media cetak.');
    return;
  }

  document.getElementById('label-total-isi').innerText = `Total Isi dalam 1 ${mediaIsi}:`;

  // Hitung halaman & lembar
  let sisaHalaman = halaman;
  if (sisiCover === "1") {
    sisaHalaman -= 2;
  } else if (sisiCover === "2" && bahanCover !== bahanIsi) {
    sisaHalaman -= 4;
  }
  if (sisaHalaman < 0) sisaHalaman = 0;

  if (sisaHalaman % 4 !== 0) {
    sisaHalaman = Math.ceil(sisaHalaman / 4) * 4;
  }

  const lembarIsi = sisaHalaman / 4;
  const cetakIsi = Math.ceil((lembarIsi * cetak) / totalDalam);

  document.getElementById('booklet-total-isi').value = `${totalDalam} pcs`;
  document.getElementById('booklet-lembar-isi').value = `${cetakIsi} Lembar ${mediaIsi}`;

  // Cover
  if (sisiCover === "2" && bahanCover === bahanIsi) {
    document.getElementById('row-total-cover').style.display = 'none';
    document.getElementById('row-lembar-cover').style.display = 'none';
  } else {
    let panjangCetakCover = spreadWidth;
    let lebarCetakCover = spreadHeight;
    if (mediaCover === "A3+") {
      panjangCetakCover += 0.4;
      lebarCetakCover += 0.4;
    }

    if (mediaCover === "A3+" || mediaCover === "LONG-CUSTOM") {
      acuanPanjang = 47.5;
      acuanLebar = 31.5;
    } else if (mediaCover === "A3") {
      acuanPanjang = 42;
      acuanLebar = 29.7;
    } else if (mediaCover === "A4") {
      acuanPanjang = 29.7;
      acuanLebar = 21;
    } else {
      showAlertModal('Pilih media cetak cover yang valid.');
      return;
    }

    const fit1Cover = Math.floor(acuanPanjang / panjangCetakCover) * Math.floor(acuanLebar / lebarCetakCover);
    const fit2Cover = Math.floor(acuanPanjang / lebarCetakCover) * Math.floor(acuanLebar / panjangCetakCover);
    let totalCover = Math.max(fit1Cover, fit2Cover);

    if (totalCover <= 0 && fit1Cover > 0) {
      totalCover = fit1Cover;
    }
    if (totalCover <= 0) {
      showAlertModal('Ukuran cover melebihi media cetak.');
      return;
    }

    const lembarCover = Math.ceil((1 * cetak) / totalCover);

    document.getElementById('label-total-cover').innerText = `Total Cover dalam 1 ${mediaCover}:`;
    document.getElementById('booklet-total-cover').value = `${totalCover} pcs`;
    document.getElementById('booklet-lembar-cover').value = `${lembarCover} Lembar ${mediaCover}`;

    document.getElementById('row-total-cover').style.display = '';
    document.getElementById('row-lembar-cover').style.display = '';
  }

  document.getElementById('output-booklet').classList.remove('hidden');
}

function resetBookletForm() {
  const ids = [
    'booklet-halaman', 'booklet-panjang', 'booklet-lebar', 'booklet-cetak',
    'booklet-bahan-cover', 'booklet-sisi-cover', 'booklet-media-cover',
    'booklet-bahan-isi', 'booklet-media-isi',
    'booklet-total-isi', 'booklet-lembar-isi',
    'booklet-total-cover', 'booklet-lembar-cover'
  ];

  ids.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = (el.tagName === 'SELECT') ? el.options[0].value : '';
  });

  document.getElementById('preset-ukuran-booklet').selectedIndex = 0;
  document.getElementById('preview-orientasi-booklet').innerText = 'Orientasi: -';
  document.getElementById('custom-size-row-booklet').classList.add('hidden');
  document.getElementById('output-booklet').classList.add('hidden');

  document.getElementById('row-total-cover').style.display = '';
  document.getElementById('row-lembar-cover').style.display = '';
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
