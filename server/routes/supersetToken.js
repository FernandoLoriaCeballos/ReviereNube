const express = require('express');
const axios = require('axios');

const router = express.Router();

const SUPERSET_BASE = process.env.SUPERSET_BASE_URL || 'http://localhost:8088';
const SUPERSET_AUTH_HEADER = process.env.SUPERSET_AUTH_HEADER || null; 
// SUPERSET_AUTH_HEADER puede ser 'Bearer <token>' o basic auth header proporcionada por ti

// POST body sample for guest token creation depends on your Superset version
// Aquí hacemos proxy: backend crea guest token y lo devuelve al frontend
router.get('/', async (req, res) => {
  try {
    // Ejemplo: crear guest token para un dashboard concreto
    const dashboardId = process.env.SUPERSET_GUEST_DASHBOARD_ID || null; // opcional
    const payload = {
      user: { username: 'guest_user', first_name: 'Guest' }, // personalizar
      resources: dashboardId ? [{ type: 'dashboard', id: Number(dashboardId) }] : [],
      // rls: [...], // si necesitas row level security
      // exp: 3600
    };

    const headers = {
      'Content-Type': 'application/json',
      ...(SUPERSET_AUTH_HEADER ? { Authorization: SUPERSET_AUTH_HEADER } : {})
    };

    const resp = await axios.post(`${SUPERSET_BASE.replace(/\/$/, '')}/api/v1/security/guest_token`, payload, { headers });

    // resp.data.token suele contener el guest token
    const token = resp?.data?.token;
    if (!token) {
      console.error('Superset guest_token response:', resp.data);
      return res.status(502).json({ message: 'No se obtuvo guest token de Superset', detail: resp.data });
    }

    return res.json({ token });
  } catch (err) {
    console.error('Error al obtener guest token from Superset:', err.response?.data || err.message || err);
    return res.status(500).json({ message: 'Error generando guest token', error: err.response?.data || err.message });
  }
});

module.exports = router;
