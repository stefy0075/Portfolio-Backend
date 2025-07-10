import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import contactRoutes from './routes/contact.js';
import dotenv from 'dotenv';

dotenv.config(); // Cargar variables de entorno

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas API
app.get('/api', (req, res) => {
  res.json({ message: 'API funcionando' });
});

// Ruta del formulario de contacto
app.use('/api/contact', contactRoutes);

// Servir archivos estáticos en producción
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));

  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../client/dist', 'index.html'));
  });
}

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
