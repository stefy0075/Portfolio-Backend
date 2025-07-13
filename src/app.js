import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

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

// Configuración del transporter de email
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
    const { user_name, user_email, user_phone, prefers_whatsapp, message } =
      req.body;

    await emailTransporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `Nuevo mensaje de ${user_name}`,
      text: `
        Nombre: ${user_name}
        Email: ${user_email}
        Teléfono: ${user_phone}
        Prefiere WhatsApp: ${prefers_whatsapp ? 'Sí' : 'No'}
        Mensaje: ${message}
      `,
      html: `
        <p><strong>Nombre:</strong> ${user_name}</p>
        <p><strong>Email:</strong> ${user_email}</p>
        <p><strong>Teléfono:</strong> ${user_phone}</p>
        <p><strong>Prefiere WhatsApp:</strong> ${
          prefers_whatsapp ? 'Sí' : 'No'
        }</p>
        <p><strong>Mensaje:</strong> ${message}</p>
      `,
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// Resto de la configuración...
app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log('Allowed origins:', allowedOrigins);
});
