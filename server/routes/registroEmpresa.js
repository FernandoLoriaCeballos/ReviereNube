const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads', 'companies');
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const safe = file.originalname.replace(/\s+/g, '_');
    cb(null, `${Date.now()}_${safe}`);
  }
});
const upload = multer({ storage });

// Única ruta: acepta multipart/form-data con campo 'logo' (max 1)
router.post('/', upload.single('logo'), async (req, res) => {
  try {
    // LOG para depuración
    console.log('--- /registro/empresa request ---');
    console.log('Headers:', req.headers);
    console.log('Body fields:', req.body);
    console.log('Files:', req.file);

    const { nombre_empresa, email, password, descripcion, telefono } = req.body;

    // Determinar filename (priorizar archivo subido)
    let filename = null;
    if (req.file && req.file.filename) filename = req.file.filename;
    else if (req.body.logo) filename = path.basename(req.body.logo);

    // Guardar en BD: reemplaza por tu lógica real
    // Ejemplo placeholder:
    const empresaGuardada = {
      nombre_empresa,
      email,
      descripcion,
      telefono,
      logo: filename,
      createdAt: new Date()
    };
    // TODO: persistir empresaGuardada en tu BD

    const logoUrl = filename ? `${req.protocol}://${req.get('host')}/uploads/companies/${filename}` : null;

    return res.status(201).json({
      success: true,
      empresa: empresaGuardada,
      logo: filename,
      logoUrl,
      message: 'Empresa registrada correctamente.'
    });
  } catch (err) {
    console.error('Error /registro/empresa:', err);
    return res.status(500).json({ success: false, message: 'Error interno al registrar empresa.' });
  }
});

module.exports = router;
