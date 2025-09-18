(function initSpiralUkuran() {
  const presetDropdown = document.getElementById('preset-ukuran-spiral');
  const customSizeRow = document.getElementById('custom-size-row-spiral');
  const previewOrientasi = document.getElementById('preview-orientasi-spiral');

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
    const panjangInput = document.getElementById('spiral-panjang');
    const lebarInput = document.getElementById('spiral-lebar');

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

  ['spiral-panjang', 'spiral-lebar'].forEach(id => {
    document.getElementById(id).addEventListener('input', () => {
      const panjang = parseFloat(document.getElementById('spiral-panjang').value);
      const lebar = parseFloat(document.getElementById('spiral-lebar').value);
      if (panjang && lebar) {
        previewOrientasi.innerText = panjang >= lebar ? 'Orientasi: Portrait' : 'Orientasi: Landscape';
      } else {
        previewOrientasi.innerText = 'Orientasi: -';
      }
    });
  });
})();

function hitungSpiral() {
  const halaman = parseInt(document.getElementById('spiral-halaman').value);
  const cetak = parseInt(document.getElementById('spiral-cetak').value);
  const panjang = parseFloat(document.getElementById('spiral-panjang').value);
  const lebar = parseFloat(document.getElementById('spiral-lebar').value);
  const bahanCover = document.getElementById('spiral-bahan-cover').value;
  const sisiCover = document.getElementById('spiral-sisi-cover').value;
  const mediaCover = document.getElementById('spiral-media-cover').value;
  const bahanIsi = document.getElementById('spiral-bahan-isi').value;
  const sisiIsi = document.getElementById('spiral-sisi-isi').value;
  const mediaIsi = document.getElementById('spiral-media-isi').value;

  if (!halaman || !cetak || !panjang || !lebar || !bahanCover || !sisiCover || !mediaCover || !bahanIsi || !sisiIsi || !mediaIsi) {
    alert('Lengkapi semua input Spiral.');
    return;
  }

  const ketebalanBahan = {
    "BOOK PAPER": 0.01322,
    "HVS 75 gsm": 0.00995,
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

  // Cek kondisi sama
  const sama = bahanCover === bahanIsi && mediaCover === mediaIsi && sisiCover === sisiIsi;

  let acuan = mediaIsi === "A3+" ? [47.5, 31.5] : mediaIsi === "A3" ? [42, 29.7] : [29.7, 21];
  document.getElementById('label-total-isi').innerText = `Total Isi dalam 1 ${mediaIsi}:`;

// Tambah bleed jika A3+
  let panjangCetak = mediaIsi === "A3+" ? panjang + 0.4 : panjang;
  let lebarCetak   = mediaIsi === "A3+" ? lebar + 0.4 : lebar;

  const fit1 = Math.floor(acuan[0] / panjangCetak) * Math.floor(acuan[1] / lebarCetak);
  const fit2 = Math.floor(acuan[0] / lebarCetak) * Math.floor(acuan[1] / panjangCetak);
  const totalDalam = Math.max(fit1, fit2);

  if (totalDalam <= 0) {
    alert('Ukuran jadi melebihi media cetak.');
    return;
  }

  if (sama) {
    // Jika sama → hanya 1 kebutuhan
    const lembarDalam = sisiIsi === "1"
  ? Math.ceil((halaman * cetak) / totalDalam)
  : Math.ceil((Math.ceil(halaman / 2) * cetak) / totalDalam);

    document.getElementById('spiral-total-cover').value = '';
    document.getElementById('spiral-lembar-cover').value = '';

    document.getElementById('row-total-cover').style.display = 'none';
    document.getElementById('row-lembar-cover').style.display = 'none';

    document.getElementById('label-lembar-isi').innerText = 'Jumlah Cetak Dalam:';

    document.getElementById('spiral-total-isi').value = `${totalDalam} pcs`;
    document.getElementById('spiral-lembar-isi').value = `${lembarDalam} Lembar ${mediaIsi}`;
  } else {

    // Default → cover & isi terpisah
    let acuanCover = mediaCover === "A3+" ? [47.5, 31.5] : mediaCover === "A3" ? [42, 29.7] : [29.7, 21];
    document.getElementById('label-total-cover').innerText = `Total Cover dalam 1 ${mediaCover}:`;

    let panjangCetakCover = mediaCover === "A3+" ? panjang + 0.4 : panjang;
    let lebarCetakCover   = mediaCover === "A3+" ? lebar + 0.4 : lebar;

    const fit1Cover = Math.floor(acuanCover[0] / panjangCetakCover) * Math.floor(acuanCover[1] / lebarCetakCover);
    const fit2Cover = Math.floor(acuanCover[0] / lebarCetakCover) * Math.floor(acuanCover[1] / panjangCetakCover);
    const totalCover = Math.max(fit1Cover, fit2Cover);

    if (totalCover <= 0) {
      alert('Ukuran jadi melebihi media cetak Cover.');
      return;
    }

    const lembarCover = Math.ceil((2 * cetak) / totalCover);

    let sisaHalaman = halaman - (sisiCover === "1" ? 2 : 4);
    const lembarIsi = sisiIsi === "1"
  ? Math.ceil((sisaHalaman * cetak) / totalDalam)
  : Math.ceil((Math.ceil(sisaHalaman / 2) * cetak) / totalDalam);

    document.getElementById('spiral-total-cover').value = `${totalCover} pcs`;
    document.getElementById('spiral-lembar-cover').value = `${lembarCover} Lembar ${mediaCover}`;

    document.getElementById('row-total-cover').style.display = '';
    document.getElementById('row-lembar-cover').style.display = '';

    document.getElementById('label-lembar-isi').innerText = 'Jumlah Cetak Isi:';

    document.getElementById('spiral-total-isi').value = `${totalDalam} pcs`;
    document.getElementById('spiral-lembar-isi').value = `${lembarIsi} Lembar ${mediaIsi}`;
  }

  const tebalCover = 2 * ketebalanBahan[bahanCover];
  const tebalIsi = (sisiIsi === "1" ? halaman : halaman / 2) * ketebalanBahan[bahanIsi];
  const totalTebal = tebalCover + tebalIsi;

  const spiralMap = [
    { number: 5, max: 0.5 },
    { number: 6, max: 0.7 },
    { number: 7, max: 0.8 },
    { number: 8, max: 0.9 },
    { number: 9, max: 1.1 },
    { number: 10, max: 1.3 },
    { number: 12, max: 1.6 },
    { number: 14, max: 1.8 },
    { number: 16, max: 2.1 },
    { number: 20, max: 3.0 },
  ];

  const nomorSpiral = spiralMap.find(s => totalTebal <= s.max)?.number || 'Custom';
  document.getElementById('spiral-nomor').value = `No. ${nomorSpiral}`;

  document.getElementById('output-spiral').classList.remove('hidden');
}

function resetSpiralForm() {
  [
    'spiral-halaman', 'spiral-cetak',
    'preset-ukuran-spiral', 'spiral-panjang', 'spiral-lebar',
    'spiral-bahan-cover', 'spiral-sisi-cover', 'spiral-media-cover',
    'spiral-bahan-isi', 'spiral-sisi-isi', 'spiral-media-isi',
    'spiral-total-cover', 'spiral-total-isi',
    'spiral-lembar-cover', 'spiral-lembar-isi', 'spiral-nomor'
  ].forEach(id => {
    const el = document.getElementById(id);
    if (el.tagName === 'SELECT') el.selectedIndex = 0;
    else el.value = '';
  });

  document.getElementById('custom-size-row-spiral').classList.add('hidden');
  document.getElementById('preview-orientasi-spiral').innerText = 'Orientasi: -';
  document.getElementById('output-spiral').classList.add('hidden');

  // Reset baris & label
  document.getElementById('row-total-cover').style.display = '';
  document.getElementById('row-lembar-cover').style.display = '';
  document.getElementById('label-lembar-isi').innerText = 'Jumlah Cetak Isi:';
}
