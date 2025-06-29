const express = require("express");
const fetch = require("node-fetch");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

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
    console.error(err);
    res.status(500).json({ status: "error", message: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Proxy jalan di port ${PORT}`));
