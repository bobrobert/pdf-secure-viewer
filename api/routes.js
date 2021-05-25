'use strict';
const express = require('express')

const controller = require('./controller');
var VerifyToken = require('./auth');

module.exports = function(app) {
   // secure viewer
   app.get('/getPng',  VerifyToken, controller.getPng);
   app.get('/prepare',  VerifyToken, controller.prepare);
   app.get('/unprepare',  VerifyToken, controller.unprepare);
   app.get('/crop',  VerifyToken, controller.crop);

};