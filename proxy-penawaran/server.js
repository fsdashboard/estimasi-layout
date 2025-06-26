const express = require('express');
const fetch = require('node-fetch');
const cors = require('cors');
const app = express();
app.use(cors());
app.use(express.json());

app.post('/kirim-penawaran', async (req, res) => {
  try {
    // Ganti endpoint di bawah dengan Google Apps Script kamu
    const endpoint = 'https://script.google.com/macros/s/AKfycbw_60i04eYSLKp_kkTjzB3BmQT5SlQPJz2SF4X4ihcsqEZ5EfUuh3YrCV8oOsRU2M_H/exec';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req.body)
    });
    const data = await response.json();
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: 'Gagal proxy ke Apps Script', details: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy server jalan di port ${PORT}`));