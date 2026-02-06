// ================== KONTEN 2 : SPANDUK FINS / M-A ==================

function showAlert(pesan) {
  if (typeof window.showAlertGlobal === "function") {
    window.showAlertGlobal(pesan);
  } else {
    alert(pesan);
  }
}

function hitungSpanduk() {
  const panjang = parseFloat(document.getElementById("spanduk-panjang")?.value);
  const lebar   = parseFloat(document.getElementById("spanduk-lebar")?.value);
  const fins    = parseFloat(document.getElementById("spanduk-fins")?.value);
  const jumlah  = parseInt(document.getElementById("spanduk-jumlah")?.value);

  if (panjang <= 0 || lebar <= 0 || fins <= 0 || jumlah <= 0) {
    showAlert("Mohon isi semua input dengan angka lebih dari 0.");
    return;
  }

  const sisiPanjang = Math.max(0, Math.ceil(panjang / fins + 1 - 2)) * 2;
  const sisiLebar   = Math.max(0, Math.ceil(lebar   / fins + 1 - 2)) * 2;
  const totalMA = (sisiPanjang + sisiLebar) * jumlah;

  document.getElementById("spanduk-totalma").value = totalMA + " PCS";
  document.getElementById("hasilSection").classList.remove("hidden");
}

function resetSpandukForm() {
  [
    "spanduk-panjang",
    "spanduk-lebar",
    "spanduk-jumlah",
    "spanduk-fins",
    "spanduk-totalma"
  ].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = "";
  });

  document.getElementById("hasilSection").classList.add("hidden");
}

function setActiveButton(active) {
  const btn1 = document.getElementById("btn1");
  const btn2 = document.getElementById("btn2");

  if (active === 1) {
    btn1.className = "px-4 py-2 bg-blue-500 text-white rounded";
    btn2.className = "px-4 py-2 bg-gray-300 text-gray-700 rounded";
  } else if (active === 2) {
    btn2.className = "px-4 py-2 bg-blue-500 text-white rounded";
    btn1.className = "px-4 py-2 bg-gray-300 text-gray-700 rounded";
  }
}
