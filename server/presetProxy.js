const express = require('express');
const fetch = require('node-fetch');
const router = express.Router();

router.post('/api/v1/preset/guest-token', async (req, res) => {
  try {
    const presetResp = await fetch('https://api.app.preset.io/v1/teams/165a4f44/workspaces/025175db/guest-token/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Si necesitas autenticación, agrega aquí el header Authorization
      },
      body: JSON.stringify(req.body)
    });
    const data = await presetResp.json();
    res.status(presetResp.status).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
