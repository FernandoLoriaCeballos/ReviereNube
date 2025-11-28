const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads (asegúrate de que la carpeta exista y tenga permisos)
const UPLOADS_ROOT = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(UPLOADS_ROOT, { maxAge: '1d' }));

// Rutas
app.use('/registro/empresa', registroEmpresaRouter);
app.use('/superset-token', supersetTokenRouter);

// Listener
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`API listening on ${PORT}`));