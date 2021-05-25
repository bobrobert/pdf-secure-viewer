
'use strict';
var tab = 0;
var req = {
  pdf: null,
  add: [
  ]
}

//var url = 'https://certificates.deepblock.io/';
var url = 'http://localhost:3003/';
//var url = 'http://api.picardev.fr/';
var tabList = ["attach", "sign", "certif", "viewer", "pdf_to_png"]
function selectTab(tab) {
  var tab_items = document.getElementsByClassName('tab_item');

  tabList.forEach(function (tabId, index) {
    const item = document.getElementById(tabId);
    if (tab == index) {
      item.style.display = 'block';
      tab_items[index].classList.add("btn_active");
    } else {
      tab_items[index].classList.remove("btn_active");
      item.style.display = 'none';
    }
  })
}
function handleFiles(fileList, mode, id) {
  switch (mode) {
    case 'initial':
      var file = fileList[0];
      var reader = new FileReader();

      // Closure to capture the file information.
      reader.onload = (function (theFile) {
        return function (e) {

          req.pdf = e.target.result;
          var elem = document.getElementById(id);
          elem.src = req.pdf;

        };
      })(file);

      // Read in the image file as a data URL.
      reader.readAsDataURL(file);
      break;
    case 'add':
      for (var i = 0; i < fileList.length; i++) {
        var file = fileList[i];

        var reader = new FileReader();

        // Closure to capture the file information.
        reader.onload = (function (theFile) {
          return function (e) {
            var add = { name: file.name, data: e.target.result };
            req.add.push(add);
          };
        })(file);

        // Read in the image file as a data URL.
        reader.readAsDataURL(file);

      }
      break;
    case 'viewer':
      var file = fileList[0];
      var reader = new FileReader();

      // Closure to capture the file information.
      reader.onload = (function (theFile) {
        return function (e) {
          if (id == 'viewerSignPdf' || id == 'attachPdf' || id == 'viewerPdftoPng') {
            req.pdf = e.target.result;
          }

          renderPdf(e.target.result, id);

        };
      })(file);

      // Read in the image file as a data URL.
      reader.readAsDataURL(file);
      break;
  }
}


/*=====================
  Signature pdf
======================*/
function signDoc(event) {

  var chekDoc = false;
  if (document.activeElement.type === 'submit') {
    if (document.activeElement.name == "tester") {
      chekDoc = true;
    }
  }
  const ngSign = document.getElementById('ngSign');
  nbSign.innerHTML = ""
  if (req.pdf == null) {
    alert("Choisissez le pdf à signer");
    return;
  }
  console.log(req.pdf);
  event.preventDefault();
   //url = 'https://pdf-marker.deepblock.io/';
   url = 'http://localhost:3003/';

  var apiUrl = chekDoc ? url + 'check' : url;
  axios.post(apiUrl, {
    data: req.pdf,
    signataires: [{ firstName : event.target['firstName'].value, lastName : event.target['lastName'].value }],
    horodatage: "25/03/2021 14:30"
  },
    {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/pdf',
        'X-Auth-Token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9',
      }
    })
    .then(function (response) {
      if (response.data.pdf) {
        renderPdf(response.data.pdf, 'viewerSignPdf');
        var container = document.querySelector('#viewerSignPdf');
        var download = container.querySelector('#download')
        download.style.display = 'block';
        download.href = response.data.pdf;
        download.download = "result.pdf";


      }

      const ngSign = document.getElementById('ngSign');
      var html = response.data.signFound
      if (chekDoc) {
        html += " signature(s)  trouvées dans le document";
      } else {
        html += " signature(s)  ajoutées au document";
      }

      if (response.data.detail) {
        response.data.detail.forEach(function (detail) {
          html += "<div>" + detail.count + " signature";
          html += detail.count > 1 ? "s" : "";
          html += " pour " + detail.name + "<div>"
        });
      }
      nbSign.innerHTML = html;
    })
    .catch(function (error) {
      console.log(error);
    });
}
/*=====================
  ajout doc to  pdf
======================*/

function attachDoc(event) {

  if (req.pdf == null) {
    alert("Choisissez le pdf à signer");
    return;
  }
  event.preventDefault();
  axios.post(url + 'pdfAttach', {
    pdf: req.pdf,
    addFiles: req.add
  },
    {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/pdf',
        'X-Auth-Token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9',
      }
    })
    .then(function (response) {
      if (response.data) {
        renderPdf(response.data, 'attachPdf');
        var container = document.querySelector('#attachPdf');
        var download = container.querySelector('#download')
        download.style.display = 'block';
        download.href = response.data;
        download.download = "result.pdf";
      }

    })
    .catch(function (error) {
      console.log("my error " + error);
    });
}
/*=====================
  create cert
======================*/

function creatCert(event) {
  event.preventDefault();

  var name= event.target['name'].value;
  var email= event.target['email'].value;
  var phone= event.target['phone'].value;
//  axios.get(url + 'pkcs12', 
//url = 'https://certificates.deepblock.io/';
url = 'http://localhost:3003/?name='+event.target['name'].value +"&email="+event.target['email'].value+"&codeOTP="+event.target['otp'].value;
  axios.get(url, 
  {headers: {'X-Auth-Token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9' }},
  )
    .then(function (response) {
      if (response.data) {
        document.querySelector('#cert').innerHTML = response.data.result.p12;
        var container = document.querySelector('#certif');
        var download = container.querySelector('#download')
        download.style.display = 'block';
        var toto = response.data.result.p12;
        download.href = response.data.result.p12;
        download.download = "cert.p12";

      }
    }).catch(error => {
      console.log(error)
    })
/*  {
    params:
    {
      name: event.target['name'].value,
      email: event.target['email'].value,
      phone: event.target['phone'].value
    }
  },
 */
}

/*==========================================
  convert pdf to png
  =====================================*/
var count = 0;
var movementX = 0;
var movementY = 0;
var moveIn = false;
function convert(event) {

  event.preventDefault();
  axios.post(url + 'pdfToPng', {
    pdf: req.pdf
  },
    {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/pdf',
        'X-Auth-Token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9',

      }
    })
    .then(function (response) {
      if (response.data.res) {
        var container = document.querySelector('#viewerPdftoPng');
        var item = container.querySelector('#viewer_page')
        container.querySelector('#page_num').innerHTML = 1;
        container.querySelector('#page_count').innerHTML = response.data.res.length;
        item.innerHTML = "";



        response.data.res.forEach(function (page, pageIndex) {
          const img = new Image();
          img.crossOrigin = 'Anonymous';
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            canvas.style.marginBottom = '10px';
            canvas.className = "page-canvas";
            canvas.id = "page" + (pageIndex + 1);
            canvas.height = img.naturalHeight;
            canvas.width = img.naturalWidth;
            ctx.drawImage(img, 0, 0);
            container.querySelector('#viewer_page').appendChild(canvas);
            if (pageIndex >= response.data.res.length - 1) {
              const div = document.createElement('div');
              div.style.position = 'absolute';
              div.style.display = 'none';
              div.width = canvas.width;
              div.height = '150';
              div.style.border = '2px solid #000';
              div.id = "window";
              const img = document.createElement('img');
              img.id = "window-img";
              div.appendChild(img);
              container.querySelector('#viewer_page').appendChild(div);

              //                '"<div id="window" style="display:none;position:absolute;width:200;height:200;border:2px solid #000; border-radius:50%">
              //<img id="window-img" src ="" style="border-radius:50%"/></div>');
              createObserver(container);
              setTimeout(function () { mouseEvent(); }, 500);

            };
          };
          img.src = page.data;
        });
        /*        
                axios.get('http://www.picardev.fr:3003/crop', {
                  params: {
                    x:203, 
                    y:203
                  }
                })
                .then(function (response) {
                  if(response.data.res){
                    var container = document.querySelector('#window-img');
                    container.src= response.data.res.data;
                  }
                })
                .catch(function (error) {
                  // handle error
                  console.log(error);
                })
        
              }
        
        
            });
        */
      }
    });
}


/*==============================
  viewer pdf
==============================*/
function createObserver(container) {
  var observer;
  observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.intersectionRatio >= 0.2 || entry.intersectionRatio >= 0.5) {
        container.querySelector('#page_num').innerHTML = entry.target.id.replace('page', '');
      }
    })
  },
    {
      root: container.querySelector('#viewer_content'),
      rootMargin: "0px",
      threshold: [0.2, 0.5]
    });

  var pages = container.querySelectorAll(".page-canvas");
  pages.forEach(page => {
    observer.observe(page);
  });
}
function renderPdf(pdfData, parentId) {
  var container = document.querySelector('#' + parentId);
  container.querySelector('#viewer_page').innerHTML = "";

  pdfjsLib
    .getDocument(pdfData)
    .promise.then(pdfDoc => {
      container.style.display = 'block';
      container.querySelector('#page_num').innerHTML = 1;
      container.querySelector('#page_count').innerHTML = pdfDoc.numPages;
      for (var i = 0; i < pdfDoc.numPages; i++) {
        pdfDoc.getPage(i + 1).then(function (page) {
          var viewport = page.getViewport({ scale: 1.5 });
          var canvas = document.createElement("canvas");
          canvas.style.marginBottom = '10px';
          canvas.className = "page-canvas";
          canvas.id = "page" + (page._pageIndex + 1);
          var context = canvas.getContext('2d');
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          page.render({ canvasContext: context, viewport: viewport });
          container.querySelector('#viewer_page').appendChild(canvas);
          if (page._pageIndex >= pdfDoc.numPages - 1) {
            createObserver(container);

          }
        });
      }

    });
}
var windowIsOn = false;
function windowOn() {
  document.querySelector('#window').style.display = 'block';
  windowIsOn = true;
}
function windowOff() {
  document.querySelector('#window').style.display = 'none';
  windowIsOn = false

}


var getCrop = true;
var prevY = 0;
function mouseEvent() {
  var container = document.querySelector('#viewerPdftoPng');
  container.querySelector('#viewer_page').onmousemove = event => {
    var newY = parseInt((event.clientY - 270 - 100) / 8) * 8;
    var parent = event.srcElement;
    // Suivi de la position de la souris dans la console
    if (prevY && Math.abs(newY - prevY) < 8) {
      newY = prevY;
    }
    document.querySelector('#window').style.top = newY + 'px';
    if (getCrop) {
      getCrop = false;
      axios.post(url + 'crop',
      { 
        y: newY < 0 ? 0 : parseInt(newY),
    
      }, 
      {
        headers: {
          'X-Auth-Token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9',

        }
      })
        .then(function (response) {
          if (response.data.res) {
            var container = document.querySelector('#window-img');
            container.src = response.data.res.data;
            //          document.querySelector('#window').style.display = 'block'
          }
          getCrop = true;
        }).catch(error => {
          console.log(error)
          getCrop = true;
        })
    }
    prevY = newY;

  }
  //}



};

$(document).ready(function () {
  selectTab(0);
  window.addEventListener('message', function(event){ 
//    alert (event.data+" "+event.origin)
}, 
    false);
});
