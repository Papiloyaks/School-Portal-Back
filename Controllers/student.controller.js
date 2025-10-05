const { studentModel, helpModel } = require('../models/student.model');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary');

cloudinary.config({ 
  cloud_name: process.env.CLOUD_NAME, 
  api_key: process.env.API_KEY, 
  api_secret: process.env.API_SECRET 
});

// ========== SIGN UP ==========
const signUp = (req, res) => {
  let info = req.body;
  let form = studentModel(info);
  form.save()
    .then((result) => {
      res.send({ status: true, message: 'Sign Up Completed', result });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send({ status: false, message: 'Error signing up', error });
    });
};

// ========== SIGN IN ==========
const signIn = (req, res) => {
  let secret = process.env.SECRET;
  let { email, password } = req.body;

  studentModel.findOne({ email })
    .then((response) => {
      if (!response) return res.send({ status: false, message: 'Wrong Credentials' });

      response.validatePassword(password, (err, same) => {
        if (!same) {
          res.send({ status: false, message: 'Wrong Credentials' });
        } else {
          const expiresInMinutes = 30;
          const expirationTimeInSeconds = expiresInMinutes * 60;
          let token = jwt.sign({ email }, secret, { expiresIn: expirationTimeInSeconds });
          res.send({ status: true, message: 'Sign In Successful', token });
        }
      });
    })
    .catch((error) => {
      console.log(error);
      res.status(500).send({ status: false, message: 'Error signing in', error });
    });
};

// ========== PORTAL ==========
const portal = (req, res) => {
  let token = req.headers.authorization.split(' ')[1];
  let secret = process.env.SECRET;

  jwt.verify(token, secret, (err, result) => {
    if (err) return res.send({ status: false, err });

    studentModel.findOne({ email: result.email })
      .then((response) => {
        res.send({ status: true, message: 'Welcome to dashboard', response });
      })
      .catch((error) => console.log(error));
  });
};

// ========== UPLOAD IMAGE ==========
const upload = (req, res) => {
  let myImage = req.body.image;
  cloudinary.v2.uploader.upload(myImage, (err, result) => {
    if (err) {
      console.log('File could not be uploaded', err);
      res.status(500).send({ status: false, message: 'Upload failed', err });
    } else {
      res.send({ message: 'Image uploaded successfully', status: true, firstImage: result.secure_url });
    }
  });
};

// ========== SEND EMAIL ==========
const sendEmail = () => {
  console.log('email works');
  var transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.NODE_EMAIL,
      pass: process.env.NODE_PASS
    },
    tls: {
      rejectUnauthorized: false,
    }
  });

  var mailOptions = {
    to: 'ibrahimabiodun069@gmail.com',
    from: 'adeniyi.ibrawhim@gmail.com',
    subject: 'Testing my Node Mailer',
    html: '<h1>Hello Mr Adeolu, how are you doing<h1>'
  };

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error);
    } else {
      console.log('Email sent:' + info.response);
    }
  });
};

// ========== HELP STUDENTS ==========
const helpStudents = async (req, res) => {
  try {
    const help = await helpModel.create(req.body);
    res.status(201).json({ message: 'Help request created', result: help });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ========== DELETE HELP ==========
const deleteHelp = async (req, res) => {
  try {
    const deleted = await helpModel.findByIdAndDelete(req.params.id);
    if (!deleted) {
      return res.status(404).json({ error: 'Help request not found' });
    }
    res.json({ message: 'Help request deleted successfully', deleted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ========== EXPORTS ==========
module.exports = {
  signUp,
  signIn,
  portal,
  upload,
  sendEmail,
  helpStudents,
  deleteHelp
};
