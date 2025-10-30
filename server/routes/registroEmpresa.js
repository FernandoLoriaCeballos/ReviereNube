const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const router = express.Router();

const UPLOADS_DIR = path.join(__dirname, '..', 'uploads', 'companies');
// Asegurar carpeta
fs.mkdirSync(UPLOADS_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOADS_DIR),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/\s+/g, '_');
    cb(null, `${Date.now()}_${safeName}`);
  }
});

const upload = multer({ storage });

// Única ruta /registro/empresa que acepta multipart/form-data o JSON
// Usar upload.fields para futuro soporte de varios campos si se añade
router.post('/', upload.fields([{ name: 'logo', maxCount: 1 }]), async (req, res) => {
  try {
    // Datos básicos
    const { nombre_empresa, email, password, descripcion, telefono } = req.body;

    // Determinar filename (priorizar archivo subido)
    let filename = null;
    if (req.files && req.files.logo && req.files.logo[0]) {
      filename = req.files.logo[0].filename;
    } else if (req.body.logo) {
      // Si llega texto/URL/ruta -> extraer basename
      filename = path.basename(req.body.logo);
    }

    // Aquí guardas en tu BD. Este es un ejemplo placeholder:
    // Reemplaza por tu lógica real (mongoose, knex, sequelize, etc.)
    // Ejemplo (pseudo):
    // const nuevaEmpresa = await Empresa.create({ nombre_empresa, email, passwordHash, descripcion, telefono, logo: filename });
    const nuevaEmpresa = {
      // ...simular objeto guardado
      nombre_empresa,
      email,
      descripcion,
      telefono,
      logo: filename,
      createdAt: new Date()
    };

    // Construir URL pública si hay filename
    const logoUrl = filename ? `${req.protocol}://${req.get('host')}/uploads/companies/${filename}` : null;

    // Responder con la info guardada y la URL pública para preview
    return res.status(201).json({
      success: true,
      empresa: nuevaEmpresa,
      logo: filename,
      logoUrl,
      message: "Empresa registrada correctamente."
    });
  } catch (err) {
    console.error('Error en /registro/empresa:', err);
    return res.status(500).json({ success: false, message: 'Error interno del servidor.' });
  }
});

module.exports = router;
