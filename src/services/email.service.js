require('dotenv').config();
const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    type: 'OAuth2',
    user: process.env.EMAIL_USER,
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET,
    refreshToken: process.env.REFRESH_TOKEN,
  },
});

// Verify the connection configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('Error connecting to email server:', error);
  } else {
    console.log('Email server is ready to send messages');
  }
});

// module.exports = transporter;

// Function to send email
const sendEmail = async (to, subject, text, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Bank Ledger" <${process.env.EMAIL_USER}>`, // sender address
      to, // list of receivers
      subject, // Subject line
      text, // plain text body
      html, // html body
    });

    console.log('Message sent: %s', info.messageId);
    console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

async function  sendRegistrationEmail(userEmail , name){
  const  subjects = "welcome to Bank Ledger"
  const text = `hello ${name},\n \n Thank you for registration at backend.
  we are exited to have you onboard! best regards \n \n bank Leager team.`
  const html = `<p>Hello ${name},</p>
  <p>Thank you for registering at Bank Ledger. We are excited to have you onboard!</p>
  <p>Best regards,<br>Bank Ledger Team</p>`
  await sendEmail(userEmail, subjects, text, html);
}

async function sendTransactionEmail(userEmail, name, amount, toAccount){
  const subjects = "Transaction Alert: Funds Transferred"
  const text = `Hello ${name},\n\nWe wanted to let you know that a transaction of amount ${amount} has been successfully transferred to account ${toAccount}.\n\nThank you for using our services!\n\nBest regards,\nBank Ledger Team.`
  const html = `<p>Hello ${name},</p>
  <p>We wanted to let you know that a transaction of amount <strong>${amount}</strong> has been successfully transferred to account <strong>${toAccount}</strong>.</p>
  <p>Thank you for using our services!</p>
  <p>Best regards,<br>Bank Ledger Team</p>`
  await sendEmail(userEmail, subjects, text, html);
}
async function sendTransactionFailedEmail(userEmail, name, amount, toAccount){
  const subjects = "Transaction Alert: Transaction Failed"
  const text = `Hello ${name},\n\nWe wanted to let you know that a transaction of amount ${amount} to account ${toAccount} has failed.\n\nPlease check your account balance and try again.\n\nBest regards,\nBank Ledger Team.`
  const html = `<p>Hello ${name},</p>
  <p>We wanted to let you know that a transaction of amount <strong>${amount}</strong> to account <strong>${toAccount}</strong> has failed.</p>
  <p>Please check your account balance and try again.</p>
  <p>Best regards,<br>Bank Ledger Team</p>`
  await sendEmail(userEmail, subjects, text, html);
}

module.exports ={
  sendRegistrationEmail,
  sendTransactionEmail,
  sendTransactionFailedEmail
} 