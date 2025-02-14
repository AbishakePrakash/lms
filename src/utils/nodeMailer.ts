// Import the Nodemailer library
import { createTransport } from 'nodemailer'; // Import specific member
import 'dotenv/config';

const sender = process.env.MAIL_SENDER;
const passkey = process.env.MAIL_PASS;

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
  host: 'email-smtp.us-east-1.amazonaws.com',
  port: 465,
  secure: true,
  auth: {
    user: 'AKIAIFSQIBLZ5OZMZPSA',
    pass: 'AqgSHYnHA7gOeveNkunLkjEEVFCr8SM+P+4e/ualuGdF',
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
