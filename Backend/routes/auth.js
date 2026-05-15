const express = require('express');
const { register, login, getMe, getStudents, getColleges, updateProfile } = require('../controllers/auth');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', getMe);
router.put('/profile', updateProfile);
router.get('/students', getStudents);
router.get('/colleges', getColleges);

module.exports = router;
