import express from 'express';
import nodemailer from 'nodemailer';

const router = express.Router();

// Configura el transporter (ejemplo para Gmail)
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER, // Definido en .env
    pass: process.env.EMAIL_PASS, // Contraseña de aplicación
  },
});

router.post('/', async (req, res) => {
  const { name, email, message } = req.body;

  const mailOptions = {
    from: email,
    to: 'tu-email@gmail.com', // 👉 Cambiá esto por tu email real
    subject: `Mensaje de ${name} desde tu portfolio`,
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error al enviar email:', error);
    res.status(500).json({ error: 'Error al enviar el mensaje' });
  }
});

export default router;
