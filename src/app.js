import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer'; // Agregado para el envío de emails

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Configuración CORS segura
const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

app.use(express.json());

// Configuración del transporter de email (seguro para producción)
const emailTransporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: process.env.NODE_ENV === 'production',
  },
});

// Ruta de prueba del email (protegida)
app.post('/api/contact', async (req, res) => {
  try {
    await emailTransporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: 'Nuevo mensaje del portfolio',
      text: `Mensaje de ${req.body.name}: ${req.body.message}`,
    });
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Resto de tu configuración...
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log('Allowed origins:', allowedOrigins);
});
