/* penawaran/script.js
   Format pintar sesuai permintaan:
   - Input bebas ketik (titik/koma)
   - Tampilkan tanpa desimal jika hasil bulat
   - Jika input mengandung desimal, tampilkan sesuai precision input (maks 8 digit)
*/
document.addEventListener("DOMContentLoaded", function () {
  // ====================================
  // FLATPICKR untuk input tanggal
  flatpickr("#tanggal", {
    dateFormat: "d-m-Y",
    defaultDate: "today",
    allowInput: true
  });

  // ====================================
  // Helper Bulan Romawi
  function getBulanRomawi(bulan) {
    const romawi = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];
    return romawi[bulan - 1];
  }

  // Format Tanggal Indo
  function formatTanggalIndo(tgl) {
    const bulan = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
    const [d, m, y] = tgl.split("-");
    return `${parseInt(d)} ${bulan[parseInt(m)-1]} ${y}`;
  }

  // Helper: cek apakah number hampir bulat (untuk mengatasi floating error)
  function isEffectivelyInteger(n) {
    const eps = 1e-9;
    return Math.abs(n - Math.round(n)) < eps;
  }

  // Format rupiah "pintar":
  // - jika bilangan bulat -> tampil tanpa desimal (contoh 1000 -> "1.000")
  // - jika ada desimal -> pakai jumlah desimal yang diberikan / default 2
  function formatRupiahSmart(value, preferredDecimals = null) {
    let num = typeof value === 'string' ? parseFloat(value.toString().replace(/,/g, '.').replace(/[^\d.]/g, '')) : Number(value);
    if (!isFinite(num)) num = 0;
    if (isEffectivelyInteger(num)) {
      return Math.round(num).toLocaleString('id-ID');
    }
    let decimals = 2;
    if (preferredDecimals !== null) decimals = preferredDecimals;
    return num.toLocaleString('id-ID', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  }

  // Sanitasi input saat mengetik: izinkan digits dan satu separator (titik)
  function sanitizeInputForTyping(raw) {
    if (!raw && raw !== 0) return "";
    raw = raw.toString();
    // Ganti koma -> titik
    raw = raw.replace(/,/g, ".");
    // Hapus karakter kecuali digit dan titik
    raw = raw.replace(/[^0-9.]/g, "");
    // Jika lebih dari satu titik, gabungkan sisanya ke sebelah kanan (keep first dot)
    const parts = raw.split(".");
    if (parts.length <= 2) return raw;
    const head = parts.shift();
    return head + "." + parts.join("");
  }

  // Ambil angka untuk kalkulasi (pakai dataset.raw bila ada)
  function getInputNumber(input) {
    if (!input) return 0;
    const raw = (input.dataset && input.dataset.raw) ? input.dataset.raw : input.value;
    const parsed = parseFloat(raw.toString().replace(/,/g, '.').replace(/[^\d.]/g, ''));
    return isFinite(parsed) ? parsed : 0;
  }

  // Saat user mengetik: simpan raw (tanpa ribuan), tampilkan apa yang diketik (raw)
  window.handleHargaInput = function(input) {
    const clean = sanitizeInputForTyping(input.value);
    input.dataset.raw = clean === "" ? "0" : clean;
    // jangan format penuh di tiap ketikan supaya tidak mengganggu pengetikan
    input.value = clean;
    if (typeof window.updateSubtotal === "function") window.updateSubtotal();
  }

  // Saat blur: format sesuai precision input (maks 8 digit desimal)
  window.handleHargaBlur = function(input) {
    const raw = (input.dataset && input.dataset.raw) ? input.dataset.raw : input.value;
    const s = (raw === "" ? "0" : String(raw));
    // hitung decimals dari input awal (jika ada), batasi sampai 8
    let decimals = 0;
    if (s.indexOf(".") >= 0) {
      decimals = Math.min(8, s.split(".")[1].length);
    }
    const num = parseFloat(s.replace(/,/g, ".").replace(/[^\d.]/g, "")) || 0;
    if (isEffectivelyInteger(num)) {
      input.value = Math.round(num).toLocaleString('id-ID');
    } else {
      // jika decimals = 0 (karena input tidak punya titik), tampilkan 2 desimal default
      const useDecimals = decimals > 0 ? decimals : 2;
      input.value = num.toLocaleString('id-ID', { minimumFractionDigits: useDecimals, maximumFractionDigits: useDecimals });
    }
    // pastikan dataset.raw tetap berisi numeric raw tanpa ribuan
    input.dataset.raw = s === "" ? "0" : s;
    if (typeof window.updateSubtotal === "function") window.updateSubtotal();
  }

  // Saat focus: tampilkan raw numeric agar mudah diedit
  window.handleHargaFocus = function(input) {
    const raw = (input.dataset && input.dataset.raw) ? input.dataset.raw : input.value;
    input.value = (raw === "" ? "0" : String(raw).replace(/,/g, "."));
    // set caret ke akhir (optional)
    try { input.selectionStart = input.selectionEnd = input.value.length; } catch(e){}
  }

  // ====================================
  // Subtotal hitung otomatis
  window.updateSubtotal = function() {
    let subtotal = 0;
    document.querySelectorAll('#produkBody tr').forEach(function(row, idx) {
      const noCell = row.querySelector('.row-no');
      if (noCell) noCell.textContent = idx + 1;
      const jumlah = row.querySelector('input[name="jumlah[]"]').valueAsNumber || 0;
      const hargaInput = row.querySelector('input[name="harga[]"]');
      const harga = getInputNumber(hargaInput);
      const rowSubtotal = jumlah * harga;
      const rpNominal = row.querySelector('.subtotal .rp-nominal');
      if (rpNominal) rpNominal.innerText = formatRupiahSmart(rowSubtotal);
      subtotal += rowSubtotal;
    });

    const ppnOption = document.getElementById('ppn-option');
    let ppn = 0;
    if (ppnOption && ppnOption.value === "ppn") {
      document.getElementById('formPPNRow').style.display = '';
      document.getElementById('formSubtotal').style.display = '';
      // ppn may be fractional; keep 2 decimals for tax if needed
      ppn = Math.round(subtotal * 0.11 * 100) / 100;
    } else {
      document.getElementById('formPPNRow').style.display = 'none';
      document.getElementById('formSubtotal').style.display = 'none';
    }

    document.getElementById('subtotalHarga').innerText = "Rp " + formatRupiahSmart(subtotal);
    document.getElementById('ppnHarga').innerText = "Rp " + formatRupiahSmart(ppn);
    document.getElementById('totalHarga').innerText = "Rp " + formatRupiahSmart(subtotal + ppn);
  }

  // ====================================
  // Tambah/Hapus baris produk
  window.tambahBaris = function() {
    const tbody = document.getElementById('produkBody');
    const row = document.createElement('tr');
    row.innerHTML = `
      <td class="row-no border text-center"></td>
      <td class="border"><textarea name="produk[]" required class="w-full border rounded p-1"></textarea></td>
      <td class="border text-center"><input type="number" name="jumlah[]" min="1" value="1" required class="w-16 border rounded p-1 text-center" /></td>
      <td class="border text-right">
        <div class="flex items-center">
          <span class="mr-1">Rp</span>
          <input type="text" name="harga[]" value="0" required class="w-36 border rounded p-1 text-right" oninput="handleHargaInput(this)" onblur="handleHargaBlur(this)" onfocus="handleHargaFocus(this)" />
        </div>
      </td>
      <td class="subtotal border text-right">
        <span>Rp</span>
        <span class="rp-nominal">0</span>
      </td>
      <td class="border text-center">
        <button type="button" onclick="hapusBaris(this)" class="bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs">Hapus</button>
      </td>
    `;
    tbody.appendChild(row);
    row.querySelectorAll('input, textarea').forEach(el => el.addEventListener('input', window.updateSubtotal));
    const hargaEl = row.querySelector('input[name="harga[]"]');
    if (hargaEl) {
      hargaEl.addEventListener('input', function() { window.handleHargaInput(this); });
      hargaEl.addEventListener('blur', function() { window.handleHargaBlur(this); });
      hargaEl.addEventListener('focus', function() { window.handleHargaFocus(this); });
      hargaEl.dataset.raw = "0";
      hargaEl.value = "0";
    }
    window.updateSubtotal();
  };

  window.hapusBaris = function(btn) {
    btn.closest('tr').remove();
    window.updateSubtotal();
  };

  // Init event untuk baris awal
  document.querySelectorAll('#produkBody input, #produkBody textarea').forEach(el => {
    el.addEventListener('input', window.updateSubtotal);
  });
  document.querySelectorAll('input[name="harga[]"]').forEach(el => {
    // pasang handler baru
    el.removeAttribute('oninput'); // hapus handler lama bila ada
    el.addEventListener('input', function() { window.handleHargaInput(this); });
    el.addEventListener('blur', function() { window.handleHargaBlur(this); });
    el.addEventListener('focus', function() { window.handleHargaFocus(this); });
    // inisialisasi dataset.raw berdasarkan nilai awal
    if (!el.dataset.raw) el.dataset.raw = sanitizeInputForTyping(el.value || "0");
    // tampilkan raw supaya user mudah mengetik (jangan auto-format pada load)
    el.value = el.dataset.raw;
  });
  const ppnOpt = document.getElementById('ppn-option');
  if (ppnOpt) ppnOpt.addEventListener('change', window.updateSubtotal);

  // ====================================
  // Submit form → preview
  const formPenawaran = document.getElementById('formPenawaran');
  if (formPenawaran) {
    formPenawaran.addEventListener('submit', function(e){
      e.preventDefault();

      const tgl = document.getElementById('tanggal').value;
      document.getElementById('pv-tanggal').innerText = tgl ? formatTanggalIndo(tgl) : '';

      document.getElementById('pv-customer').innerText = document.getElementById('customer').value;
      document.getElementById('pv-alamat').innerHTML = document.getElementById('alamat').value.replace(/\n/g,"<br>");
      let pengirimValue = document.getElementById('pengirim').value.trim();
      document.getElementById('pv-pengirim').innerText = pengirimValue;
      document.getElementById('pv-pengirim-inline').innerText = pengirimValue ? `(${pengirimValue})` : '';

      const catatanForm = document.getElementById('catatan').value.trim();
      const pvCatatan = document.getElementById('pv-catatan');
      if (catatanForm) {
        pvCatatan.style.display = "block";
        let lines = catatanForm.split(/\r?\n/).filter(x => x.trim() !== "");
        pvCatatan.innerHTML = `<span class="note-label">Note :</span>` + lines.map(line => `<div>${line}</div>`).join("");
      } else {
        pvCatatan.style.display = "none";
        pvCatatan.innerHTML = "";
      }

      const pvBody = document.getElementById('pv-produkBody');
      pvBody.innerHTML = '';
      let subtotal = 0;
      document.querySelectorAll('#produkBody tr').forEach(function(row, idx) {
        const nama = row.querySelector('textarea[name="produk[]"]').value.replace(/\n/g,"<br>");
        const jumlah = row.querySelector('input[name="jumlah[]"]').value;
        const hargaInput = row.querySelector('input[name="harga[]"]');
        const harga = getInputNumber(hargaInput);
        const rowSubtotal = jumlah * harga;
        subtotal += rowSubtotal;
        // determine preferred decimals for harga display based on input precision
        let prefDecimals = 0;
        const raw = (hargaInput && hargaInput.dataset && hargaInput.dataset.raw) ? hargaInput.dataset.raw : '';
        if (raw && raw.indexOf('.') >= 0) {
          prefDecimals = Math.min(8, raw.split('.')[1].length);
        }
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="td-center">${idx+1}</td>
          <td>${nama}</td>
          <td class="td-center">${jumlah}</td>
          <td><div class="nominal-cell"><span class="rp-label">Rp</span><span class="rp-nominal">${formatRupiahSmart(harga, prefDecimals)}</span></div></td>
          <td><div class="nominal-cell"><span class="rp-label">Rp</span><span class="rp-nominal">${formatRupiahSmart(rowSubtotal)}</span></div></td>
        `;
        pvBody.appendChild(tr);
      });

      const ppnOption = document.getElementById('ppn-option');
      let ppn = 0;
      if (ppnOption && ppnOption.value === "ppn") {
        ppn = Math.round(subtotal * 0.11 * 100) / 100;
        document.getElementById('pv-ppnRow').style.display = '';
        document.getElementById('pv-subtotalRow').style.display = '';
      } else {
        document.getElementById('pv-ppnRow').style.display = 'none';
        document.getElementById('pv-subtotalRow').style.display = 'none';
      }

      document.getElementById('pv-subtotalHarga').innerHTML = `<div class="nominal-cell"><span class="rp-label">Rp</span><span class="rp-nominal">${formatRupiahSmart(subtotal)}</span></div>`;
      document.getElementById('pv-ppnHarga').innerHTML = `<div class="nominal-cell"><span class="rp-label">Rp</span><span class="rp-nominal">${formatRupiahSmart(ppn)}</span></div>`;
      document.getElementById('pv-totalHarga').innerHTML = `<div class="nominal-cell"><span class="rp-label">Rp</span><span class="rp-nominal">${formatRupiahSmart(subtotal + ppn)}</span></div>`;

      document.querySelectorAll('.sidebar-print-hide').forEach(el => el.style.display = 'none');
      document.getElementById('previewPenawaran').style.display = 'block';

      // placeholder nomor surat awal
      document.getElementById("pv-noSurat").textContent = `XXX`;
    });
  }

  window.editPenawaran = function() {
    document.querySelectorAll('.sidebar-print-hide').forEach(el => el.style.display = '');
    document.getElementById('previewPenawaran').style.display = 'none';
  };

  // ====================================
  // Kirim ke Google Sheet & cetak
  async function kirimKeGoogleSheet(data) {
    try {
      const response = await fetch("https://script.google.com/macros/s/AKfycbxAqfHg4tsuZDNIzk3RhvzLXzMpLgAz0uH47Pm4K2rdWG-ygPq9Hpj2pokOnRWWavEm/exec", {
        method: "POST",
        // JANGAN pakai application/json agar tidak preflight
        headers: { "Content-Type": "text/plain;charset=utf-8" },
        body: JSON.stringify(data)
      });
      if (!response.ok) throw new Error('Gagal mengirim data ke Google Sheet');
      const result = await response.json();
      return result.noInvoice;
    } catch (error) {
      alert("Terjadi kesalahan: " + error.message);
      return null;
    }
  }

  const btn = document.querySelector('#btnPrint');
  if (btn) {
    btn.addEventListener("click", async function (e) {
      e.preventDefault();
      const loading = document.getElementById("loadingOverlay");
      if (loading) loading.style.display = "flex";

      try {
        const tgl = document.getElementById("tanggal").value;
        const [d, m, y] = tgl.split("-");
        const bulanRomawi = getBulanRomawi(parseInt(m));

        const data = {
          tanggal: tgl,
          customer: document.getElementById("customer").value,
          alamat: document.getElementById("alamat").value,
          pengirim: document.getElementById("pengirim").value,
          catatan: document.getElementById("catatan").value,
          ppn: document.getElementById("ppn-option").value,
          produk: Array.from(document.querySelectorAll('#produkBody tr')).map(row => ({
            nama: row.querySelector('textarea[name="produk[]"]').value,
            jumlah: row.querySelector('input[name="jumlah[]"]').value,
            harga: row.querySelector('input[name="harga[]"]').value
          })),
          subtotal: document.getElementById('subtotalHarga').innerText,
          ppn_nominal: document.getElementById('ppnHarga').innerText,
          total: document.getElementById('totalHarga').innerText,
          linkPDF: ""
        };
        const noInvoiceBaru = await kirimKeGoogleSheet(data);
        document.getElementById("pv-noSurat").textContent = noInvoiceBaru;
        if (loading) loading.style.display = "none";
        window.print();
      } catch (err) {
        console.error("Gagal kirim data:", err);
        if (loading) loading.style.display = "none"; // tutup loader meskipun error
        alert("Terjadi kesalahan saat mengirim data!");
      }
    });
  }

  // ====================================
  // Init awal
  document.querySelectorAll('input[name="harga[]"]').forEach(el => {
    if (!el.dataset.raw) el.dataset.raw = sanitizeInputForTyping(el.value || "0");
    el.value = el.dataset.raw;
  });
  window.updateSubtotal();

});
