const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();

// ✅ Middleware CORS dengan pengaturan lengkap
app.use(cors({
  origin: "https://fsdashboard.github.io",
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"]
}));

app.use(express.json());

// ✅ Endpoint utama POST
app.post("/kirim-penawaran", async (req, res) => {
  try {
    const endpoint = "https://script.google.com/macros/s/AKfycbzxtY67pkwLlajoHompRB6lOfNIW69z5MWrO9fVDttlEVkEPEzI--Rz2BbdZrnqEGcm/exec";
    
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req.body)
    });

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error("❌ Error saat kirim ke Google Script:", err.message);
    res.status(500).json({ status: "error", message: err.message });
  }
});

// ✅ Jalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ Proxy aktif di port ${PORT}`);
});
