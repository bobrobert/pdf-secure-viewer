'use strict'

/**
 * @apiName getPng
 * @apiGroup viewer
 *
 * @api {get} /getPng  
 * @apiParam {String}   fileToken     token reçu de la requête /prepare
 * 
 *
 * @apiSuccess {object} images        array images png floutées 
 * 

 */

var fs = require('fs');
var gm = require('gm');

function getBlurImages(fileToken) {
  return new Promise((resolve, reject) => {

    var index = 0;
    var res = { count: 0, width: 0, height: 0, png: [] }
    var found = true
    if(!fs.existsSync('images/blur/' + fileToken + '_0.png')){
      resolve(res);
    }else{

      gm('images/blur/' + fileToken + '_0.png')
        .size(function (err, size) {
          if (err) {
            resolve(res);
          }
          res.width = size.width;
          res.height = size.height;
          while (found) {
            try {
              const data = fs.readFileSync('images/blur/' + fileToken + "_" + index + '.png', 'base64');
              res.png.push("data:image/png;base64," + data);
              res.count++;
            } catch (err) {
              found = false;
            }
            index++;
          }
          resolve(res);
        });
      }
  });
};


var getPng = {
  blurImages: function (req, res, next) {
    getBlurImages(req.query.fileToken).then(function (result) {
      res.status(200).json(result);
    });
  }

};
module.exports = getPng;
