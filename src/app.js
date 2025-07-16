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

// Configuración del transporter de email con conexiones persistentes
const emailTransporter = nodemailer.createTransport({
  service: 'Gmail',
  pool: true, // Habilita conexiones persistentes
  maxConnections: 5, // Número máximo de conexiones
  maxMessages: 100, // Máximo de emails por conexión
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Health check endpoint para Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date() });
});

// Ruta de prueba del email (protegida)
app.post('/api/contact', async (req, res) => {
  // Establece timeout de 10 segundos
  req.setTimeout(10000, () => {
    res.status(504).json({ error: 'Timeout al enviar el mensaje' });
  });

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

// Iniciar servidor con optimizaciones de timeout
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log('Allowed origins:', allowedOrigins);
});

// Optimización de conexiones Keep-Alive (importante para Render)
server.keepAliveTimeout = 60000; // 60 segundos
server.headersTimeout = 65000; // 65 segundos (debe ser > keepAliveTimeout)
