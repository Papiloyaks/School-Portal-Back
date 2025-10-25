const express = require('express');
const router = express.Router();

// ✅ Import all controller functions, including deleteHelp
const {
  signUp,
  signIn,
  portal,
  upload,
  sendEmail,
  helpStudents,
  deleteHelp, // add this here
} = require('../Controllers/student.controller');

// ✅ Routes
router.post('/signup', signUp);
router.post('/signin', signIn);
router.get('/portal', portal);
router.post('/image', upload);
router.get('/sendemail', sendEmail);
router.post('/help', helpStudents);
router.delete('/help/:id', deleteHelp); // works now

module.exports = router;
