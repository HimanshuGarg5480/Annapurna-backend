const express = require('express');
const ngoRouter = express.Router();
const User = require('../models/user');
const ngoController = require('../controllers/ngoController');

//user login
ngoRouter.get('/ngo/login',ngoController.loginNgo);

//user signup
ngoRouter.post('/ngo/signUp', ngoController.createNgo);



module.exports = ngoRouter;
