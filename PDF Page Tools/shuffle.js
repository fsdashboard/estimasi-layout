// shuffle.js (final)
const rotasiStatus = {};

function buatMatrix(list, baris, kolom, posisi, balikKolom = false) {
  const matrix = Array.from({ length: baris }, () => Array(kolom).fill(""));
  for (let r = 0; r < baris; r++) {
    for (let c = 0; c < kolom; c++) {
      let index;
      if (posisi === "Portrait") {
        index = balikKolom ? ((kolom - 1 - c) * baris + r) : (c * baris + r);
      } else {
        index = balikKolom ? (r * kolom + (kolom - 1 - c)) : (r * kolom + c);
      }
      if (index < list.length) matrix[r][c] = list[index];
    }
  }
  return { matrix };
}

function buatTabel(matrix, title) {
  const wrapper = document.createElement("div");
  wrapper.innerHTML = `<strong>${title}:</strong>`;
  const table = document.createElement("table");
  table.className = "mt-2 w-full border text-center";

  matrix.forEach(row => {
    const tr = document.createElement("tr");
    row.forEach(cell => {
      const td = document.createElement("td");
      td.className = "border p-1 align-top";
      if (!cell) {
        td.innerHTML = `<div class="rotate-box"><div>&nbsp;</div></div>`;
      } else {
        td.innerHTML = `
          <div class="rotate-box">
            <div>${cell}</div>
            <div class="rotate-row">
              <label class="text-xs">
                <input type="checkbox" class="rotate-left accent-blue-600" data-page="${cell}" ${rotasiStatus[cell]?.left90 ? "checked" : ""}>
                <span class="ml-1 text-xs">↺90°</span>
              </label>
              <label class="text-xs">
                <input type="checkbox" class="rotate-right accent-blue-600" data-page="${cell}" ${rotasiStatus[cell]?.right90 ? "checked" : ""}>
                <span class="ml-1 text-xs">↻90°</span>
              </label>
              <label class="text-xs">
                <input type="checkbox" class="rotate-180 accent-blue-600" data-page="${cell}" ${rotasiStatus[cell]?.rot180 ? "checked" : ""}>
                <span class="ml-1 text-xs">*180°</span>
              </label>
            </div>
          </div>
        `;
      }
      tr.appendChild(td);
    });
    table.appendChild(tr);
  });

  wrapper.appendChild(table);
  return wrapper;
}

function formatGabungan(list) {
  return list.map(n => {
    const r = rotasiStatus[n];
    let txt = String(n);
    if (r) {
      if (r.left90) txt += "<";
      else if (r.right90) txt += ">";
      else if (r.rot180) txt += "*";
    }
    return txt;
  }).join(" ");
}

function syncCheckboxGroup(page) {
  const r = rotasiStatus[page] || { left90:false, right90:false, rot180:false };
  document.querySelectorAll(`[data-page="${page}"]`).forEach(cb => {
    if (cb.classList.contains("rotate-left")) cb.checked = !!r.left90;
    else if (cb.classList.contains("rotate-right")) cb.checked = !!r.right90;
    else if (cb.classList.contains("rotate-180")) cb.checked = !!r.rot180;
  });
}

function buatAcuan() {
  const isiHalaman = parseInt(document.getElementById("isiHalaman").value);
  const posisi = document.getElementById("posisi").value;
  const baris = parseInt(document.getElementById("baris").value);
  const kolom = parseInt(document.getElementById("kolom").value);
  const slide = document.getElementById("slide").value;
  const showSlide = document.getElementById("toggleSlide").checked;

  if (!isiHalaman || !posisi || !baris || !kolom || !slide) {
    showAlert("Mohon lengkapi semua input shuffle pages!");
    return;
  }

  const totalHalaman = (slide === "2 Sisi") ? isiHalaman * 2 : isiHalaman;
  const angkaList = Array.from({ length: totalHalaman }, (_, i) => i + 1);
  const output = document.getElementById("output");
  output.innerHTML = "";

  let hasilGabung = [];

  if (slide === "1 Sisi") {
    const { matrix } = buatMatrix(angkaList, baris, kolom, posisi);
    if (showSlide) output.appendChild(buatTabel(matrix, "Slide 1"));
    matrix.forEach(row => hasilGabung.push(...row));
  } else {
    const ganjilList = angkaList.filter(n => n % 2 === 1);
    const genapList = angkaList.filter(n => n % 2 === 0);
    const { matrix: matrix1 } = buatMatrix(ganjilList, baris, kolom, posisi);
    if (showSlide) output.appendChild(buatTabel(matrix1, "Slide 1 (Ganjil)"));
    matrix1.forEach(row => hasilGabung.push(...row));
    const { matrix: matrix2 } = buatMatrix(genapList, baris, kolom, posisi, true);
    if (showSlide) output.appendChild(buatTabel(matrix2, "Slide 2 (Genap - Kolom Dibalik)"));
    matrix2.forEach(row => hasilGabung.push(...row));
  }

  hasilGabung = hasilGabung.filter(x => x !== "" && x !== null && typeof x !== "undefined");

  const hasilText = document.createElement("div");
  hasilText.className = "mt-6 p-4 bg-gray-50 border rounded flex justify-between items-start gap-4";
  hasilText.innerHTML = `
    <div>
      <strong>Gabungan Halaman:</strong><br>
      <span id="hasilText">${formatGabungan(hasilGabung)}</span>
    </div>
    <button id="copyBtn" class="text-blue-600 hover:text-blue-800 text-sm">📋 Copy</button>
  `;
  output.appendChild(hasilText);

  document.getElementById("copyBtn").addEventListener("click", copyHasil);

  // Rotasi checkboxes
  document.querySelectorAll(".rotate-left").forEach(cb => cb.addEventListener("change", e => {
    const page = parseInt(e.target.dataset.page);
    if (!rotasiStatus[page]) rotasiStatus[page] = { left90:false, right90:false, rot180:false };
    rotasiStatus[page] = { left90:false, right90:false, rot180:false };
    if (e.target.checked) rotasiStatus[page].left90 = true;
    syncCheckboxGroup(page);
    document.getElementById("hasilText").textContent = formatGabungan(hasilGabung);
  }));
  document.querySelectorAll(".rotate-right").forEach(cb => cb.addEventListener("change", e => {
    const page = parseInt(e.target.dataset.page);
    if (!rotasiStatus[page]) rotasiStatus[page] = { left90:false, right90:false, rot180:false };
    rotasiStatus[page] = { left90:false, right90:false, rot180:false };
    if (e.target.checked) rotasiStatus[page].right90 = true;
    syncCheckboxGroup(page);
    document.getElementById("hasilText").textContent = formatGabungan(hasilGabung);
  }));
  document.querySelectorAll(".rotate-180").forEach(cb => cb.addEventListener("change", e => {
    const page = parseInt(e.target.dataset.page);
    if (!rotasiStatus[page]) rotasiStatus[page] = { left90:false, right90:false, rot180:false };
    rotasiStatus[page] = { left90:false, right90:false, rot180:false };
    if (e.target.checked) rotasiStatus[page].rot180 = true;
    syncCheckboxGroup(page);
    document.getElementById("hasilText").textContent = formatGabungan(hasilGabung);
  }));
}

function copyHasil() {
  const text = document.getElementById("hasilText").textContent;
  navigator.clipboard.writeText(text).then(() => showAlert("Hasil gabungan berhasil disalin!", "success"))
    .catch(() => showAlert("Gagal menyalin ke clipboard (izin ditolak)."));
}

function resetForm() {
  document.getElementById("isiHalaman").value = "";
  document.getElementById("posisi").value = "-- Auto --";
  document.getElementById("baris").value = "";
  document.getElementById("kolom").value = "";
  document.getElementById("slide").value = "-- Sided --";
  document.getElementById("toggleSlide").checked = false;
  document.getElementById("output").innerHTML = "";
  for (const key in rotasiStatus) delete rotasiStatus[key];
}

// alert helper (modal)
function showAlert(pesan, tipe="error") {
  const modal = document.getElementById("customAlert");
  const alertBox = document.getElementById("alertBox");
  const alertTitle = document.getElementById("alertTitle");
  document.getElementById("alertMessage").textContent = pesan;
  if (tipe === "success") {
    alertTitle.textContent = "BERHASIL!";
    alertTitle.className = "text-lg font-bold text-blue-600 mb-2";
    setTimeout(tutupAlert, 2000);
  } else {
    alertTitle.textContent = "PERINGATAN!";
    alertTitle.className = "text-lg font-bold text-red-600 mb-2";
  }
  modal.classList.remove("hidden");
  requestAnimationFrame(() => alertBox.classList.add("modal-show"));
}

function tutupAlert() {
  const modal = document.getElementById("customAlert");
  const alertBox = document.getElementById("alertBox");
  alertBox.classList.remove("modal-show");
  alertBox.classList.add("modal-hide");
  setTimeout(() => {
    modal.classList.add("hidden");
    alertBox.classList.remove("modal-hide");
  }, 300);
}

// expose globally
window.buatAcuan = buatAcuan;
window.resetForm = resetForm;
window.copyHasil = copyHasil;
window.showAlert = showAlert;
window.tutupAlert = tutupAlert;
