'use strict';
const axios = require('axios');
var prepare = require('../service/prepare');
var getPng = require('../service/getPng');
var cropPng = require('../service/pngCrop');
var controllers = {
    prepare: function (req, res) {
        if (req.query.id && req.query.h) {
            var host = req.query.dev === undefined? 'https://api.vitalsign.fr/api/contracts/' : 'https://api-dev.vitalsign.fr/api/contracts/'
            axios.get(host + req.query.id + '/pdf?hash=' + req.query.h,
                {
                    responseType: 'arraybuffer',
                    headers: {
                        'Accept': 'application/pdf'
                    }
                })
                .then(function (response) {
                    prepare.getPng(response.data.toString('base64'), res);
                })
                .catch(function (error) {
                    return res.status(400).send({ error: 'Invalid arguments' });
                    console.log(error);
                });
        } else {
            return res.status(400).send({ error: 'Invalid arguments' });
        }

    },
    unprepare: function (req, res) {
        if( !req.query.fileToken) {
            return res.status(400).send({ error: 'Invalid arguments' });
        }
        prepare.killPng(req.query.fileToken, res, function (err, dist) {
        });
        
    },

    getPng: function (req, res) {
        if( !req.query.fileToken) {
            return res.status(400).send({ error: 'Invalid arguments' });
        }
        getPng.blurImages(req, res, function (err, dist) {
        });
        
    },
    crop: function (req, res) {
        cropPng.crop(req, res, function (err, dist) {
        });
    },
};

module.exports = controllers;

