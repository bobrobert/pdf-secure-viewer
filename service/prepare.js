'use strict'

/**
 * @apiName prepare
 * @apiGroup viewer
 *
 * @api {get} /prepare Signature manuscrite d'un pdf
 * @apiParam {String}   id 
 * @apiParam {String}   hash
 * @apiParam {boolean}  dev 
 * 
 *
 * @apiSuccess {String} token               png file name
 * 

 */
const { fromBuffer, fromBase64, fromPath } = require('pdf2pic');
var Jimp = require('jimp');
var fs = require('fs');
const { PDFDocument } = require('pdf-lib');
const del = require('del');

const options = {
  density: 330,
  //format: "png",
  width: 2550,
  height: 3300
};

async function getPng(pdfBase64) {
  var pdfDoc
  try {
  pdfDoc = await PDFDocument.load(pdfBase64);
  }
  catch(err) { 
    console.log("err");
    return({result:"failed", error:"pdf not found"})
  }
  const countPages = pdfDoc.getPageCount();
  const page= pdfDoc.getPage(0);
  options.width = parseInt(page.getWidth()*1.5);
  options.height =  parseInt(page.getHeight()*1.5);

  var fileToken =Math.random().toString(36).substring(3) +Math.floor(Date.now() / 1000);
  var convert = await fromBase64(pdfBase64, options);
  for (var i = 0; i < countPages; i++) {
    var output = await convert(i +1, true).catch(function (err) { 
      return ({result : "error", "error" : err });
     });;
    var buf = await Buffer.from(output.base64, 'base64');
    fs.writeFileSync('images/origin/'+fileToken +"_"+ i + '.png', buf, 'binary');
    var image = await Jimp.read(buf).catch(function (err) { console.log("error " + err) });;;
    image.blur(6, function(err){
      if (err) return ({result : "error", "error" : err });
    }).write('images/blur/'+fileToken +"_"+ i + '.png');

  }
  return ({result:"success", fileToken:fileToken});
}

async function deleteFiles(fileToken){
  console.log('images/origin/' + fileToken + '_*.png');
  del(['images/origin/' + fileToken + '_*.png']);
  del(['images/blur/' + fileToken + '_*.png']);
  return { res: "success"};
}
var services = {
  getPng: function (pdfBase64, res) {
    getPng(pdfBase64).then(function (result) {
      res.status(200).json(result);
    });
  },
  killPng:function (fileToken, res) {
    deleteFiles(fileToken).then(function (result) {
      res.status(200).json(result);
    });
  }
};
module.exports = services;