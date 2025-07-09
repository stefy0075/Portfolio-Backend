const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer'); // Para enviar emails

// Configura el transporter (ejemplo para Gmail)
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER, // Define esto en .env
    pass: process.env.EMAIL_PASS, // Usa contraseña de aplicación
  },
});

router.post('/', async (req, res) => {
  const { name, email, message } = req.body;

  const mailOptions = {
    from: email,
    to: 'tu-email@gmail.com',
    subject: `Mensaje de ${name} desde tu portfolio`,
    text: message,
  };

  try {
    await transporter.sendMail(mailOptions);
    res.status(200).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error al enviar el mensaje' });
  }
});

module.exports = router;
