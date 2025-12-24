// konfigurasi umum (mudah di-tweak)
const PANEL_PENALTY = 2.0;        // penalti per panel (dipakai di cost)
const SUGGESTION_MIN_PERCENT = 2; // minimal % penghematan agar saran tampil
const SUGGESTION_MIN_AREA = 0.2;  // minimal selisih area (m^2) agar saran tampil

const bahanData = {
  china280: {
    globalMax: 3.1,
    minimalList: [1, 1.5, 2, 2.5, 3],
    rolls: [
      { width: 1.1, minimal: 1.0, maksimal: 1.0 },
      { width: 1.6, minimal: 1.5, maksimal: 1.5 },
      { width: 2.2, minimal: 2.0, maksimal: 2.1 },
      { width: 2.6, minimal: 2.5, maksimal: 2.5 },
      { width: 3.2, minimal: 3.0, maksimal: 3.1 }
    ],
    seamNotRecommended: false
  },
  china340: {
    globalMax: 3.1,
    minimalList: [1, 1.5, 2, 2.5, 3],
    rolls: [
      { width: 1.1, minimal: 1.0, maksimal: 1.0 },
      { width: 1.6, minimal: 1.5, maksimal: 1.5 },
      { width: 2.2, minimal: 2.0, maksimal: 2.1 },
      { width: 2.6, minimal: 2.5, maksimal: 2.5 },
      { width: 3.2, minimal: 3.0, maksimal: 3.1 }
    ],
    seamNotRecommended: false
  },
  korea: {
    globalMax: 3.1,
    minimalList: [1, 1.5, 2,  3],
    rolls: [
      { width: 1.1, minimal: 1.0, maksimal: 1.0 },
      { width: 1.6, minimal: 1.5, maksimal: 1.5 },
      { width: 2.2, minimal: 2.0, maksimal: 2.1 },
      { width: 3.2, minimal: 3.0, maksimal: 3.1 }
    ],
    seamNotRecommended: false
  },
  germany: {
    globalMax: 3.1,
    minimalList: [1, 2, 3],
    rolls: [
      { width: 1.1, minimal: 1.0, maksimal: 1.0 },
      { width: 2.2, minimal: 2.0, maksimal: 2.1 },
      { width: 3.2, minimal: 3.0, maksimal: 3.1 }
    ],
    seamNotRecommended: false
  },
  backlitechina: {
    globalMax: 3.1,
    minimalList: [1, 2, 3],
    rolls: [
      { width: 2.2, minimal: 2.0, maksimal: 2.1 },
      { width: 3.2, minimal: 3.0, maksimal: 3.1 }
    ],
    seamNotRecommended: true,
    seamWarning: "Backlite cenderung menunjukkan garis sambungan; hindari sambung jika memungkinkan."
  }
};

// util
function isPasMinimal(nilai, minimalList) {
  const eps = 1e-6;
  return minimalList.some(v => Math.abs(v - nilai) < eps);
}
function getNeighbors(nilai, minimalList) {
  let lower = null, upper = null;
  for (let i = 0; i < minimalList.length; i++) {
    const v = minimalList[i];
    if (v <= nilai) lower = v;
    if (v >= nilai && upper === null) upper = v;
  }
  return { lower, upper };
}
function minimalNaikTerdekat(nilai, minimalList) {
  for (let i = 0; i < minimalList.length; i++) {
    if (minimalList[i] >= nilai) return minimalList[i];
  }
  return nilai;
}
function findRollForSizes(maxSize, rolls) {
  const candidates = rolls.filter(r => r.maksimal >= maxSize);
  if (candidates.length === 0) return null;
  candidates.sort((a, b) => a.width - b.width);
  return candidates[0];
}
function hasRollForValue(value, rolls) {
  return rolls.some(r => r.maksimal >= value);
}
function isAtMaksimal(value, rolls) {
  const eps = 1e-6;
  return rolls.some(r => Math.abs(r.maksimal - value) < eps);
}
function nearestStandard(nilai, minimalList) {
  let best = minimalList[0], bestDiff = Math.abs(minimalList[0] - nilai);
  for (let i = 1; i < minimalList.length; i++) {
    const diff = Math.abs(minimalList[i] - nilai);
    if (diff < bestDiff) { best = minimalList[i]; bestDiff = diff; }
  }
  return { standard: best, diff: bestDiff };
}
function upperStandard(nilai, minimalList) {
  for (let i = 0; i < minimalList.length; i++) if (minimalList[i] >= nilai) return minimalList[i];
  return null;
}
function findCommonDivider(p, l, minimal, maksimal, maxDiv = 20) {
  for (let d = 2; d <= maxDiv; d++) {
    const pDiv = p / d;
    const lDiv = l / d;
    if ((pDiv >= minimal && pDiv <= maksimal) || (lDiv >= minimal && lDiv <= maksimal)) {
      return { divisor: d, potongP: pDiv, potongL: lDiv };
    }
  }
  const dFallback = Math.max(1, Math.ceil(Math.max(p / maksimal, l / maksimal)));
  return { divisor: dFallback, potongP: p / dFallback, potongL: l / dFallback };
}

function updateBahanWarning() {
  const el = document.getElementById("bahan");
  const warn = document.getElementById("bahanWarning");
  if (!el || !warn) return;
  const key = el.value;
  const info = bahanData[key];
  if (info && info.seamNotRecommended) {
    warn.classList.remove("hidden");
    warn.classList.add("text-sm", "text-orange-600");
    warn.innerText = info.seamWarning || "Material ini kurang direkomendasikan untuk finishing sambung.";
  } else {
    warn.classList.add("hidden");
    warn.innerText = "";
  }
}

function hitung() {
  const pInput = document.getElementById("panjang").value;
  const lInput = document.getElementById("lebar").value;
  let p = parseFloat(pInput);
  let l = parseFloat(lInput);
  const bahanKey = document.getElementById("bahan").value;

  if (isNaN(p) || isNaN(l)) { alert("Masukkan panjang dan lebar yang valid (angka)."); return; }
  if (p <= 0 || l <= 0) { alert("Panjang dan lebar harus lebih besar dari 0."); return; }

  const bahanInfo = bahanData[bahanKey];
  if (!bahanInfo) { alert("Jenis bahan tidak dikenali."); return; }

  const { globalMax, minimalList, rolls } = bahanInfo;

  let hasilP = p, hasilL = l, panel = 1, ukuranPanel = "-", note = "";
  const minimalGlobal = minimalList[0];

  const originalArea = p * l;

  // BEGIN main logic: minimal checks, exceed handling, splitting, suggestions
  if (p < minimalGlobal && l < minimalGlobal) {
    hasilP = minimalGlobal; hasilL = minimalGlobal;
    note = "Kedua ukuran desain di bawah minimal cetak. Di-set ke minimal.";
  } else if (p < minimalGlobal || l < minimalGlobal) {
    hasilP = p < minimalGlobal ? minimalGlobal : p;
    hasilL = l < minimalGlobal ? minimalGlobal : l;
    note = "Salah satu ukuran desain di bawah minimal cetak. Ukuran tersebut di-set ke minimal.";
  } else {
    const pExceedGlobal = p > globalMax;
    const lExceedGlobal = l > globalMax;

    if (pExceedGlobal || lExceedGlobal) {
      // Ketika salah satu dimensi exceed, coba naikkan dimensi lain ke minimal terdekat.
      if (pExceedGlobal && !lExceedGlobal) {
        const naikL = minimalNaikTerdekat(l, minimalList);
        if (naikL !== l && hasRollForValue(naikL, rolls) && naikL <= globalMax) {
          hasilL = naikL;
          panel = 1;
          ukuranPanel = "-";
          note = `Lebar dinaikkan ke minimal terdekat (${naikL} m). Panjang melebihi kapasitas tapi tidak perlu potongan karena lebar sudah dalam standar cetak.`;
        } else {
          const divInfo = findCommonDivider(p, l, minimalGlobal, globalMax);
          panel = divInfo.divisor || Math.ceil(p / globalMax);
          ukuranPanel = divInfo.potongP && divInfo.potongL ? `${divInfo.potongP.toFixed(2)} x ${divInfo.potongL.toFixed(2)} m` : "-";
          note = `Lebar tidak dapat dinaikkan ke standard yang sesuai; panjang melebihi maksimal; diperlukan pembagian ${panel} panel.`;
        }
      } else if (!pExceedGlobal && lExceedGlobal) {
        const naikP = minimalNaikTerdekat(p, minimalList);
        if (naikP !== p && hasRollForValue(naikP, rolls) && naikP <= globalMax) {
          hasilP = naikP;
          panel = 1;
          ukuranPanel = "-";
          note = `Panjang dinaikkan ke minimal terdekat (${naikP} m). Lebar melebihi kapasitas tapi tidak perlu potongan karena panjang sudah dalam standar cetak.`;
        } else {
          const divInfo = findCommonDivider(p, l, minimalGlobal, globalMax);
          panel = divInfo.divisor || Math.ceil(l / globalMax);
          ukuranPanel = divInfo.potongP && divInfo.potongL ? `${divInfo.potongP.toFixed(2)} x ${divInfo.potongL.toFixed(2)} m` : "-";
          note = `Panjang tidak dapat dinaikkan ke standard yang sesuai; lebar melebihi maksimal; diperlukan pembagian ${panel} panel.`;
        }
      } else {
        // KEDUA DIMENSI MELEBIHI globalMax
        const maxDiv = 10;
        const candidatesD2 = [];

        const subP2 = p / 2;
        const upP2 = upperStandard(subP2, minimalList);
        if (upP2 !== null && upP2 <= globalMax && hasRollForValue(upP2, rolls)) {
          const produksiP = upP2 * 2;
          const produksiL = l;
          const area = produksiP * produksiL;
          candidatesD2.push({ split: "p", divisor: 2, subRounded: upP2, produksiP, produksiL, area });
        }

        const subL2 = l / 2;
        const upL2 = upperStandard(subL2, minimalList);
        if (upL2 !== null && upL2 <= globalMax && hasRollForValue(upL2, rolls)) {
          const produksiL = upL2 * 2;
          const produksiP = p;
          const area = produksiP * produksiL;
          candidatesD2.push({ split: "l", divisor: 2, subRounded: upL2, produksiP, produksiL, area });
        }

        if (candidatesD2.length > 0) {
          candidatesD2.sort((a, b) => a.area - b.area);
          const best2 = candidatesD2[0];
          panel = best2.divisor;
          if (best2.split === "p") {
            hasilP = best2.produksiP;
            hasilL = best2.produksiL;
            ukuranPanel = `${best2.subRounded.toFixed(2)} x ${l.toFixed(2)} m`;
            note = `Kedua dimensi melebihi kapasitas; prioritas 2 potong dipenuhi dengan membagi panjang menjadi 2 potong.`;
          } else {
            hasilP = best2.produksiP;
            hasilL = best2.produksiL;
            ukuranPanel = `${p.toFixed(2)} x ${best2.subRounded.toFixed(2)} m`;
            note = `Kedua dimensi melebihi kapasitas; prioritas 2 potong dipenuhi dengan membagi lebar menjadi 2 potong.`;
          }

          // ===== PERBAIKAN: cari alternatif (d >= 3) pada kedua axis (panjang & lebar) =====
          const best2Cost = best2.area + PANEL_PENALTY * (best2.divisor - 1);
          let bestAlt = null;

          // periksa semua d >= 3 pada axis panjang
          for (let d = 3; d <= maxDiv; d++) {
            const sub = p / d;
            const up = upperStandard(sub, minimalList);
            if (up !== null && up <= globalMax && hasRollForValue(up, rolls)) {
              const produksiP = up * d;
              const produksiL = l;
              const area = produksiP * produksiL;
              const cost = area + PANEL_PENALTY * (d - 1);
              if (!bestAlt || cost < bestAlt.cost) {
                bestAlt = { axis: "p", d, up, produksiP, produksiL, area, cost };
              }
            }
          }

          // periksa semua d >= 3 pada axis lebar
          for (let d = 3; d <= maxDiv; d++) {
            const sub = l / d;
            const up = upperStandard(sub, minimalList);
            if (up !== null && up <= globalMax && hasRollForValue(up, rolls)) {
              const produksiL = up * d;
              const produksiP = p;
              const area = produksiP * produksiL;
              const cost = area + PANEL_PENALTY * (d - 1);
              if (!bestAlt || cost < bestAlt.cost) {
                bestAlt = { axis: "l", d, up, produksiP, produksiL, area, cost };
              }
            }
          }

          // jika ada alternatif lebih murah berdasarkan cost, dan penghematan signifikan -> tambahkan saran (styled)
          if (bestAlt && bestAlt.cost + 1e-9 < best2Cost) {
            const areaBest2 = best2.area;
            const areaAlt = bestAlt.area;
            const areaDiff = areaBest2 - areaAlt; // >0 artinya alt lebih hemat
            const percent = (areaDiff / areaBest2) * 100;

            if (areaDiff >= SUGGESTION_MIN_AREA || percent >= SUGGESTION_MIN_PERCENT) {
              const jumlahAlt = bestAlt.d;
              const produksiAltP = bestAlt.produksiP;
              const produksiAltL = bestAlt.produksiL;
              let perPotongAltP, perPotongAltL;

              if (bestAlt.axis === "p") {
                perPotongAltP = bestAlt.up;
                perPotongAltL = l;
              } else {
                perPotongAltP = p;
                perPotongAltL = bestAlt.up;
              }

              const saranHTML = `
                <div class="mt-2 p-3 bg-red-50 border border-red-200 rounded">
                  <div class="flex items-start gap-3">
                    <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5 text-red-600 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M8.257 3.099c.366-.756 1.415-.756 1.781 0l6.518 13.48A1 1 0 0 1 15.78 18H4.22a1 1 0 0 1-.776-1.421L8.257 3.1zM11 14a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1-9a1 1 0 0 0-.993.883L9 6v4a1 1 0 0 0 1.993.117L11 10V6a1 1 0 0 0-1-1z" clip-rule="evenodd" />
                    </svg>
                    <div>
                      <div class="text-red-700 font-semibold">Saran: untuk hasil lebih efisien bisa menggunakan ${jumlahAlt} potongan dengan :</div>
                      <div class="text-sm text-gray-700 mt-2">
                        <div><strong>Ukuran Cetak Produksi:</strong> ${produksiAltP.toFixed(2)} x ${produksiAltL.toFixed(2)} m</div>
                        <div><strong>Jumlah Potongan:</strong> ${jumlahAlt}</div>
                        <div><strong>Ukuran per Potong:</strong> ${perPotongAltP.toFixed(2)} x ${perPotongAltL.toFixed(2)} m</div>
                      </div>
                      <div class="text-sm text-gray-600 mt-2">
                        Estimasi total area (pilihan sekarang): <strong>${areaBest2.toFixed(2)} m²</strong>. Alternatif: <strong>${areaAlt.toFixed(2)} m²</strong> — hemat <strong>${areaDiff.toFixed(2)} m²</strong> (${percent.toFixed(1)}%).
                      </div>
                    </div>
                  </div>
                </div>
              `;

              note = `${note}<br>${saranHTML}`;
            } // end threshold check
          } // end bestAlt exists
          // ===== akhir perbaikan =====

        } else {
          // tidak ada kandidat d=2 valid --> lanjut cost-based search (seperti sebelumnya)
          let best = { cost: Infinity, area: Infinity, divisor: 1, split: null, subRounded: null, produksiP: p, produksiL: l };

          for (let d = 2; d <= maxDiv; d++) {
            const sub = p / d;
            const up = upperStandard(sub, minimalList);
            if (up !== null && up <= globalMax && hasRollForValue(up, rolls)) {
              const produksiP = up * d;
              const produksiL = l;
              const area = produksiP * produksiL;
              const cost = area + PANEL_PENALTY * (d - 1);
              if (cost < best.cost || (Math.abs(cost - best.cost) < 1e-9 && (area < best.area || (Math.abs(area - best.area) < 1e-9 && d < best.divisor)))) {
                best = { cost, area, split: "p", divisor: d, subRounded: up, produksiP, produksiL };
              }
            }
          }

          for (let d = 2; d <= maxDiv; d++) {
            const sub = l / d;
            const up = upperStandard(sub, minimalList);
            if (up !== null && up <= globalMax && hasRollForValue(up, rolls)) {
              const produksiL = up * d;
              const produksiP = p;
              const area = produksiP * produksiL;
              const cost = area + PANEL_PENALTY * (d - 1);
              if (cost < best.cost || (Math.abs(cost - best.cost) < 1e-9 && (area < best.area || (Math.abs(area - best.area) < 1e-9 && d < best.divisor)))) {
                best = { cost, area, split: "l", divisor: d, subRounded: up, produksiP, produksiL };
              }
            }
          }

          if (best.split !== null) {
            panel = best.divisor;
            if (best.split === "p") {
              hasilP = best.produksiP;
              hasilL = best.produksiL;
              ukuranPanel = `${best.subRounded.toFixed(2)} x ${l.toFixed(2)} m`;
              note = `Kedua dimensi melebihi kapasitas; membagi panjang menjadi ${panel} potong (dipilih berdasarkan cost).`;
            } else {
              hasilP = best.produksiP;
              hasilL = best.produksiL;
              ukuranPanel = `${p.toFixed(2)} x ${best.subRounded.toFixed(2)} m`;
              note = `Kedua dimensi melebihi kapasitas; membagi lebar menjadi ${panel} potong (dipilih berdasarkan cost).`;
            }
          } else {
            const divInfo = findCommonDivider(p, l, minimalGlobal, globalMax);
            panel = divInfo.divisor || 1;
            ukuranPanel = divInfo.potongP && divInfo.potongL ? `${divInfo.potongP.toFixed(2)} x ${divInfo.potongL.toFixed(2)} m` : "-";
            note = `Kedua dimensi melebihi maksimal; diperlukan pembagian ${panel} panel (fallback).`;
          }
        }
      }
    } else {
      // Kedua <= globalMax
      const pPas = isPasMinimal(p, minimalList);
      const lPas = isPasMinimal(l, minimalList);

      // Jika salah satu ukuran PAS dengan nilai maksimal roll -> jangan ubah, biarkan as-is
      const atMaxP = isAtMaksimal(p, rolls);
      const atMaxL = isAtMaksimal(l, rolls);

      if (pPas || lPas) {
        note = "Salah satu ukuran sudah pas ke daftar minimal cetak; tidak ada penyesuaian.";
      } else if (atMaxP || atMaxL) {
        note = "Salah satu ukuran pas dengan maksimal cetak; tidak ada penyesuaian.";
      } else {
        // Kembalikan logika lama: bandingkan kenaikan ke minimal atas (upperStandard) dan pilih yang paling dekat
        const nP = getNeighbors(p, minimalList);
        const nL = getNeighbors(l, minimalList);

        const diffPDown = nP.lower !== null ? (p - nP.lower) : Infinity;
        const diffPUp = nP.upper !== null ? (nP.upper - p) : Infinity;
        const diffLDown = nL.lower !== null ? (l - nL.lower) : Infinity;
        const diffLUp = nL.upper !== null ? (nL.upper - l) : Infinity;

        const AMBANG_DEKAT_BAWAH = 0.10;
        if (diffPDown <= AMBANG_DEKAT_BAWAH || diffLDown <= AMBANG_DEKAT_BAWAH) {
          note = "Salah satu ukuran sangat dekat ke nilai minimal bawah; ukuran tetap.";
        } else {
          if (diffPUp === Infinity && diffLUp === Infinity) {
            note = "Tidak ada standard atas tersedia untuk kenaikan; tidak ada penyesuaian.";
          } else if (diffPUp <= diffLUp) {
            const candidateP = nP.upper;
            if (candidateP !== null && candidateP > p) {
              const neededRoll = findRollForSizes(candidateP, rolls);
              if (neededRoll) {
                hasilP = candidateP;
                note = `Panjang dinaikkan ke minimal terdekat (${candidateP} m).`;
              } else {
                note = `Panjang naik ke ${candidateP} tidak memungkinkan karena tidak ada roll yang sesuai; tidak ada penyesuaian.`;
              }
            } else {
              note = "Tidak ada kenaikan yang diperlukan pada panjang.";
            }
          } else {
            const candidateL = nL.upper;
            if (candidateL !== null && candidateL > l) {
              const neededRoll = findRollForSizes(candidateL, rolls);
              if (neededRoll) {
                hasilL = candidateL;
                note = `Lebar dinaikkan ke minimal terdekat (${candidateL} m).`;
              } else {
                note = `Lebar naik ke ${candidateL} tidak memungkinkan karena tidak ada roll yang sesuai; tidak ada penyesuaian.`;
              }
            } else {
              note = "Tidak ada kenaikan yang diperlukan pada lebar.";
            }
          }
        }
      }
    }
  }
  // END main logic

  // Jika bahan tidak direkomendasikan untuk sambung dan panel > 1, tambah peringatan
  if (bahanInfo && bahanInfo.seamNotRecommended && panel > 1) {
    const seamMsg = bahanInfo.seamWarning || "Bahan ini kurang direkomendasikan untuk finishing sambung.";
    const seamHTML = `<div class="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-orange-700 text-sm"><strong>Peringatan:</strong> ${seamMsg}</div>`;
    note = `${note}<br>${seamHTML}`;
  }

  // tampilkan hasil
  document.getElementById("hasil").classList.remove("hidden");
  document.getElementById("ukuranCetak").innerText = `${hasilP.toFixed(2)} x ${hasilL.toFixed(2)} m`;
  document.getElementById("jumlahPanel").innerText = panel;
  document.getElementById("ukuranPanel").innerText = panel > 1 ? ukuranPanel : "-";
  document.getElementById("keterangan").innerHTML = note;
}

/**
 * Reset form inputs and hide result area.
 */
function resetForm() {
  const elP = document.getElementById("panjang");
  const elL = document.getElementById("lebar");
  const elBahan = document.getElementById("bahan");
  const elHasil = document.getElementById("hasil");

  if (elP) elP.value = "";
  if (elL) elL.value = "";
  if (elBahan) {
  elBahan.value = "";
  $('#bahan').val(null).trigger('change');
}

  if (elHasil) {
    elHasil.classList.add("hidden");
    const eUkuran = document.getElementById("ukuranCetak");
    const eJumlah = document.getElementById("jumlahPanel");
    const ePanel = document.getElementById("ukuranPanel");
    const eKeterangan = document.getElementById("keterangan");
    if (eUkuran) eUkuran.innerText = "";
    if (eJumlah) eJumlah.innerText = "";
    if (ePanel) ePanel.innerText = "";
    if (eKeterangan) eKeterangan.innerText = "";
  }

  // update badge bahan setelah reset
  updateBahanWarning();

  if (elP) elP.focus();
}