const nodemailer = require('nodemailer');

function createTransporter(email, password) {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: email,
      pass: password
    },
    secure: true, // Use TLS
  });
}

module.exports = createTransporter;
