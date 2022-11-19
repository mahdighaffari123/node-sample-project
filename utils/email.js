const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // 1) Create a transporter
  const transport = nodemailer.createTransport({
    host: 'smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: 'a646e9b349d394',
      pass: '13806e53b56365',
    },
  });

  // 2) Define the email option
  const mailOptions = {
    from: 'mahdi ghaffari <mahdi.ghaffari28@gmail.com>',
    to: options.email,
    subject: options.subject,
    text: options.text,
  };

  // 3) Actually send the email
  await transport.sendMail(mailOptions);
};

module.exports = sendEmail;
