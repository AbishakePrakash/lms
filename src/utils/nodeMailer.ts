// Import the Nodemailer library
import { createTransport } from 'nodemailer'; // Import specific member
import 'dotenv/config';

const host = process.env.AWS_MAIL_HOST;
const port = process.env.AWS_MAIL_PORT || 465;
const sender = process.env.AWS_MAIL_SENDER;
const passkey = process.env.AWS_MAIL_PASS;

// console.log('Sender:', sender);
// console.log('Passkey:', passkey);

// Create a transporter object
// var transporter = createTransport({
//   service: 'gmail',
//   auth: {
//     user: sender,
//     pass: passkey,
//   },

// });

const transporter = createTransport({
  host: host,
  port: Number(port),
  secure: true,
  auth: {
    user: sender,
    pass: passkey,
  },
});

// Configure the mailoptions object
export default async function triggerMaileEvent(mailOptions: any) {
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
    return info.response;
  } catch (error) {
    console.log('Error in triggerEvent:', error);
  }
}
