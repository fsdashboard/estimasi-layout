document.addEventListener('DOMContentLoaded', function() {
  // Format angka ke Rupiah
  function formatRupiah(angka) {
    angka = angka || 0;
    angka = (typeof angka === "string") ? angka.replace(/[^\d]/g, "") : angka;
    angka = parseInt(angka) || 0;
    return angka.toLocaleString('id-ID');
  }

  // Format input harga ke Rupiah dan update subtotal
  function formatInputRupiah(input) {
    let value = input.value.replace(/[^\d]/g, "");
    if(value === "") value = "0";
    input.value = formatRupiah(value);
    updateSubtotal();
  }

  // Ambil angka dari input harga
  function getInputNumber(input) {
    return parseInt(input.value.replace(/[^\d]/g, "")) || 0;
  }

  // Update subtotal, ppn, total
  function updateSubtotal() {
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

    // PPN dropdown
    const ppnOption = document.getElementById('ppn-option');
    let ppn = 0;
    if (ppnOption && ppnOption.value === "ppn") {
      document.getElementById('formPPNRow').style.display = '';
      document.getElementById('formSubtotal').style.display = '';
      ppn = Math.round(subtotal * 0.11);
    } else {
      document.getElementById('formPPNRow').style.display = 'none';
      document.getElementById('formSubtotal').style.display = 'none';
      ppn = 0;
    }

    document.getElementById('subtotalHarga').innerText = "Rp " + formatRupiah(subtotal);
    document.getElementById('ppnHarga').innerText = "Rp " + formatRupiah(ppn);

    // Total akhir
    document.getElementById('totalHarga').innerText = "Rp " + formatRupiah(subtotal + ppn);
  }

  // Fungsi tambah baris produk
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
    row.querySelectorAll('input, textarea').forEach(el => {
      el.addEventListener('input', updateSubtotal);
    });
    row.querySelector('input[name="harga[]"]').addEventListener('input', function() {
      formatInputRupiah(this);
    });
    updateSubtotal();
  };

  // Fungsi hapus baris produk
  window.hapusBaris = function(btn) {
    btn.closest('tr').remove();
    updateSubtotal();
  };

  // Listener input pada baris produk pertama
  document.querySelectorAll('#produkBody input, #produkBody textarea').forEach(el => {
    el.addEventListener('input', updateSubtotal);
  });
  document.querySelectorAll('input[name="harga[]"]').forEach(el => {
    el.addEventListener('input', function() { formatInputRupiah(this); });
  });

  // PPN dropdown event
  document.getElementById('ppn-option').addEventListener('change', updateSubtotal);

  // Fungsi submit form: tampilkan preview & sembunyikan sidebar/main
  document.getElementById('formPenawaran').addEventListener('submit', function(e){
    e.preventDefault();
    const tgl = document.getElementById('tanggal').value;
    document.getElementById('pv-tanggal').innerText = tgl ? formatTanggalIndo(tgl) : '';
    const customerVal = document.getElementById('customer').value;
    const alamatVal = document.getElementById('alamat').value.replace(/\n/g,"<br>");
    document.getElementById('pv-customer').innerText = customerVal;
    document.getElementById('pv-alamat').innerHTML = alamatVal;
    let pengirimValue = document.getElementById('pengirim').value.trim();
    document.getElementById('pv-pengirim').innerText = pengirimValue;
    document.getElementById('pv-pengirim-inline').innerText = pengirimValue ? `(${pengirimValue})` : '';
    const catatanForm = document.getElementById('catatan').value.trim();
    const pvCatatan = document.getElementById('pv-catatan');
    if (catatanForm) {
      pvCatatan.style.display = "block";
      let lines = catatanForm.split(/\r?\n/).filter(x => x.trim() !== "");
      pvCatatan.innerHTML = `<span class="note-label">Note :</span>` +
        lines.map(line => `<div>${line}</div>`).join("");
    } else {
      pvCatatan.style.display = "none";
      pvCatatan.innerHTML = "";
    }
    const pvBody = document.getElementById('pv-produkBody');
    pvBody.innerHTML = '';
    let subtotal = 0;
    // produk rows
    document.querySelectorAll('#produkBody tr').forEach(function(row, idx) {
      const nama = row.querySelector('textarea[name="produk[]"]').value.replace(/\n/g,"<br>");
      const jumlah = row.querySelector('input[name="jumlah[]"]').value;
      const hargaInput = row.querySelector('input[name="harga[]"]');
      const harga = getInputNumber(hargaInput);
      const rowSubtotal = (jumlah * harga);
      subtotal += rowSubtotal;
      const tr = document.createElement('tr');
      tr.innerHTML = `
        <td class="td-center">${idx+1}</td>
        <td>${nama}</td>
        <td class="td-center">${jumlah}</td>
        <td>
          <div class="nominal-cell">
            <span class="rp-label">Rp</span>
            <span class="rp-nominal">${formatRupiah(harga)}</span>
          </div>
        </td>
        <td>
          <div class="nominal-cell">
            <span class="rp-label">Rp</span>
            <span class="rp-nominal">${formatRupiah(rowSubtotal)}</span>
          </div>
        </td>
      `;
      pvBody.appendChild(tr);
    });
    // PPN dropdown
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
    // Subtotal & PPN di preview
    document.getElementById('pv-subtotalHarga').innerHTML =
      `<div class="nominal-cell"><span class="rp-label">Rp</span><span class="rp-nominal">${formatRupiah(subtotal)}</span></div>`;
    document.getElementById('pv-ppnHarga').innerHTML =
      `<div class="nominal-cell"><span class="rp-label">Rp</span><span class="rp-nominal">${formatRupiah(ppn)}</span></div>`;
    // Total
    document.getElementById('pv-totalHarga').innerHTML =
      `<div class="nominal-cell"><span class="rp-label">Rp</span><span class="rp-nominal">${formatRupiah(subtotal+ppn)}</span></div>`;

    // Sembunyikan sidebar & main konten, tampilkan preview
    document.querySelectorAll('.sidebar-print-hide').forEach(el => el.style.display = 'none');
    document.getElementById('previewPenawaran').style.display = 'block';
  });

  // Fungsi kembali ke edit form: tampilkan sidebar/main, sembunyikan preview
  window.editPenawaran = function() {
    document.querySelectorAll('.sidebar-print-hide').forEach(el => el.style.display = '');
    document.getElementById('previewPenawaran').style.display = 'none';
  };

  // Format tanggal ke Indonesia
  function formatTanggalIndo(tgl) {
    const bulan = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
    const [y, m, d] = tgl.split("-");
    return `${parseInt(d)} ${bulan[parseInt(m)-1]} ${y}`;
  }

  // Inisialisasi awal: format harga pertama dan update subtotal
  formatInputRupiah(document.querySelector('input[name="harga[]"]'));
  updateSubtotal();


// ===============================================
// 🔁 Kirim data ke Google Sheets saat klik Print
// ===============================================

  async function kirimKeGoogleSheet(data) {
    try {
      const response = await fetch("https://script.google.com/macros/s/AKfycbwFvVPdKGFXU73C_S0HUBKQQpx7mpxONfSYxm_kdjWVW5zIEPPhj6u3ASEyWK_DvL0BxQ/exec", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      return result.noInvoice || "ERROR/AMK/XX/YYYY";
    } catch (err) {
      console.error("Gagal kirim ke Google Sheets:", err);
      return "ERROR/AMK/XX/YYYY";
    }
  }

  const btn = document.querySelector('#btnPrint');
  if (btn) {
    btn.addEventListener("click", async function (e) {
      e.preventDefault();

      const data = {
        tanggal: document.getElementById("tanggal").value,
        customer: document.getElementById("customer").value,
        linkPDF: "" // akan dikembangkan kalau kamu ingin otomatis upload PDF
      };

      const noInvoiceBaru = await kirimKeGoogleSheet(data);
      document.getElementById("pv-noSurat").textContent = noInvoiceBaru;

      window.print();
    });
  }
});