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

  // Format Rupiah
  function formatRupiah(angka) {
    angka = angka || 0;
    angka = (typeof angka === "string") ? angka.replace(/[^\d]/g, "") : angka;
    angka = parseInt(angka) || 0;
    return angka.toLocaleString('id-ID');
  }

  window.formatInputRupiah = function(input) {
    let value = input.value.replace(/[^\d]/g, "");
    if (value === "") value = "0";
    input.value = formatRupiah(value);
    if (typeof window.updateSubtotal === "function") window.updateSubtotal();
  }

  function getInputNumber(input) {
    return parseInt(input.value.replace(/[^\d]/g, "")) || 0;
  }

  // ====================================
  // Subtotal hitung otomatis
  window.updateSubtotal = function() {
    let subtotal = 0;
    document.querySelectorAll('#produkBody tr').forEach(function(row, idx) {
      row.querySelector('.row-no').textContent = idx + 1;
      const jumlah = row.querySelector('input[name="jumlah[]"]').valueAsNumber || 0;
      const hargaInput = row.querySelector('input[name="harga[]"]');
      const harga = getInputNumber(hargaInput);
      const rowSubtotal = jumlah * harga;
      row.querySelector('.subtotal .rp-nominal').innerText = formatRupiah(rowSubtotal);
      subtotal += rowSubtotal;
    });

    const ppnOption = document.getElementById('ppn-option');
    let ppn = 0;
    if (ppnOption && ppnOption.value === "ppn") {
      document.getElementById('formPPNRow').style.display = '';
      document.getElementById('formSubtotal').style.display = '';
      ppn = Math.round(subtotal * 0.11);
    } else {
      document.getElementById('formPPNRow').style.display = 'none';
      document.getElementById('formSubtotal').style.display = 'none';
    }

    document.getElementById('subtotalHarga').innerText = "Rp " + formatRupiah(subtotal);
    document.getElementById('ppnHarga').innerText = "Rp " + formatRupiah(ppn);
    document.getElementById('totalHarga').innerText = "Rp " + formatRupiah(subtotal + ppn);
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
          <input type="text" name="harga[]" value="0" required class="w-24 border rounded p-1 text-right" oninput="formatInputRupiah(this)" />
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
    row.querySelector('input[name="harga[]"]').addEventListener('input', function() {
      window.formatInputRupiah(this);
    });
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
    el.addEventListener('input', function() { window.formatInputRupiah(this); });
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
        const harga = getInputNumber(row.querySelector('input[name="harga[]"]'));
        const rowSubtotal = jumlah * harga;
        subtotal += rowSubtotal;
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td class="td-center">${idx+1}</td>
          <td>${nama}</td>
          <td class="td-center">${jumlah}</td>
          <td><div class="nominal-cell"><span class="rp-label">Rp</span><span class="rp-nominal">${formatRupiah(harga)}</span></div></td>
          <td><div class="nominal-cell"><span class="rp-label">Rp</span><span class="rp-nominal">${formatRupiah(rowSubtotal)}</span></div></td>
        `;
        pvBody.appendChild(tr);
      });

      const ppnOption = document.getElementById('ppn-option');
      let ppn = 0;
      if (ppnOption && ppnOption.value === "ppn") {
        ppn = Math.round(subtotal * 0.11);
        document.getElementById('pv-ppnRow').style.display = '';
        document.getElementById('pv-subtotalRow').style.display = '';
      } else {
        document.getElementById('pv-ppnRow').style.display = 'none';
        document.getElementById('pv-subtotalRow').style.display = 'none';
      }

      document.getElementById('pv-subtotalHarga').innerHTML = `<div class="nominal-cell"><span class="rp-label">Rp</span><span class="rp-nominal">${formatRupiah(subtotal)}</span></div>`;
      document.getElementById('pv-ppnHarga').innerHTML = `<div class="nominal-cell"><span class="rp-label">Rp</span><span class="rp-nominal">${formatRupiah(ppn)}</span></div>`;
      document.getElementById('pv-totalHarga').innerHTML = `<div class="nominal-cell"><span class="rp-label">Rp</span><span class="rp-nominal">${formatRupiah(subtotal + ppn)}</span></div>`;

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
    const response = await fetch("https://script.google.com/macros/s/AKfycbx3yUGTPNmOTQo19BXUckk-vL_JoizNVpkfm1JRWCm861La1v0rV__NzZMg5PqjnMea/exec", {
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
      window.print();
    });
  }

  // ====================================
  // Init awal
  const hargaInputAwal = document.querySelector('input[name="harga[]"]');
  if (hargaInputAwal) window.formatInputRupiah(hargaInputAwal);
  window.updateSubtotal();

});
