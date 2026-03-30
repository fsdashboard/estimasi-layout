// organize.js
function generateOrganize() {
  const batas = parseInt(document.getElementById('batas').value);
  const kelipatan = parseInt(document.getElementById('kelipatan').value);
  let tambahan = document.getElementById('tambahan').value;
  tambahan = tambahan === "" ? 0 : parseInt(tambahan);

  const warning = document.getElementById("warningOrganize");

  if (!batas || !kelipatan || batas <= 0 || kelipatan <= 0) {
    warning.classList.remove("hidden");
    document.getElementById('hasilOrganize').value = "";
    return;
  } else {
    warning.classList.add("hidden");
  }

  let hasil = [];
  for (let i = kelipatan; i <= batas; i += kelipatan) {
    let start = i - tambahan;
    if (start < 1) start = 1;
    for (let x = start; x <= i; x++) {
      hasil.push(x);
    }
  }

  document.getElementById('hasilOrganize').value = hasil.join(",");
}

function copyOrganize() {
  const text = document.getElementById("hasilOrganize").value;
  if (!text) return;
  navigator.clipboard.writeText(text).then(() => {
    const notif = document.getElementById("notifOrganize");
    notif.classList.remove("hidden");
    setTimeout(() => notif.classList.add("hidden"), 1500);
  });
}

function clearOrganize() {
  document.getElementById('batas').value = "";
  document.getElementById('kelipatan').value = "";
  document.getElementById('tambahan').value = "";
  document.getElementById('hasilOrganize').value = "";
  document.getElementById("warningOrganize").classList.add("hidden");
  document.getElementById("notifOrganize").classList.add("hidden");
}

// expose global
window.generateOrganize = generateOrganize;
window.copyOrganize = copyOrganize;
window.clearOrganize = clearOrganize;
