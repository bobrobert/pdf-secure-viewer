'use strict'

/**
 * @apiName crop
 * @apiGroup viewer
 *
 * @api {get} /crop   get part of visible image
 * @apiParam {String}   fileToken     token reçu de la requête /prepare
 * 
 * @apiSuccess {Base64} data       
 * 

 */

var fs = require('fs');
var Jimp = require('jimp');

/*===============================================
 crop png
 ====================*/
async function doCrop(req) {

  if(!fs.existsSync('images/origin/' + req.query.fileToken + "_" + req.query.page + '.png')){
    return { res: "fail" };
  }
  var image = await Jimp.read('images/origin/' + req.query.fileToken + "_" + req.query.page + '.png');

    var y = req.query.y < 0 ? 0 : req.query.y;
    var maxY = parseInt(y) + 150;
    var h = 150;
    console.log(image.bitmap.height + " " + maxY)
    if (maxY > image.bitmap.height) {
      h = image.bitmap.height - parseInt(y);;
    }
    var img = await image.crop(0, parseInt(y), image.bitmap.width, h < 0 ? 0 : h).getBase64Async(Jimp.MIME_PNG);
    return { res: "success", page: 1, data: img };
}



var cropPng = {
  crop: function (req, res, next) {
    doCrop(req).then(function (result) {
      res.status(200).json(result);
    });
  }

};
module.exports = cropPng;
