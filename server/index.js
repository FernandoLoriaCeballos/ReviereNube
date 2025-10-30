const express = require('express');
const path = require('path');
const cors = require('cors');

const registroEmpresaRouter = require('./routes/registroEmpresa');

const app = express();
app.use(cors());

// Parse JSON bodies for endpoints that might use JSON
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos de uploads (accesible en /uploads/...)
const UPLOADS_ROOT = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(UPLOADS_ROOT));

// Registrar la ruta única
app.use('/registro/empresa', registroEmpresaRouter);

// Si no tienes otro listener, añade esto para pruebas locales:
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});