
import nodemailer from 'nodemailer';

// Depuración: mostrar valores de las variables de entorno
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? '[PROVIDED]' : '[NOT PROVIDED]');

// Configura el transporte de nodemailer para Mailtrap
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export async function sendConfirmationEmail(to, subject, html) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    html
  };
  return transporter.sendMail(mailOptions);
}
