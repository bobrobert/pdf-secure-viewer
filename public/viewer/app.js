
'use strict';

var pdfFileToken = 0;
var pdfImageHeight = 0;
//var host = 'http://api.picardev.fr:3000/'
var host = 'https://pdf-secure-viewer.deepblock.io/';
function viewPdf(fileToken) {
  pdfFileToken = fileToken;
  var url = host + 'getPng?fileToken=' + fileToken;
  axios.get(url,
    {
      headers: {
        'X-Auth-Token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9',
      },
    }).then(resp => {
      renderPdf(resp.data);
    });
}
function loadPdfFile(file) {
  renderPdf(file);
}
function buildThresholdList(numSteps) {
  var thresholds = [];

  for (var i = 1.0; i <= numSteps; i++) {
    var ratio = i / numSteps;
    thresholds.push(ratio);
  }

  thresholds.push(0);
  return thresholds;
}
var pageRatio = [];

function getCurrentPageNumber() {
  var result = 0;
  var maxRatio = 0;
  pageRatio.forEach(function (page, index) {
    if (page.iRatio > maxRatio) {
      maxRatio = page.iRatio;
      result = index;
    }
  });
  return result + 1;
}
function createObserver(container) {
  var observer;
  observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.target.info == "last-page") {
        window.parent.postMessage('End of page reached', "*");
      }
      var pageNumber = parseInt(entry.target.id.replace('page', ''));
      if (pageRatio[pageNumber].iRatio != entry.intersectionRatio) {
        pageRatio[pageNumber].iRatio = entry.intersectionRatio;
        container.querySelector('#page_num').innerHTML = getCurrentPageNumber();
      }
    })
  },
    {
      root: container.querySelector('#viewer_page'),
      rootMargin: "0px",
      threshold: buildThresholdList(10) //[0.2, 0.5]
    });

  var pages = container.querySelectorAll(".page-viewer");
  pages.forEach(page => {
    observer.observe(page);
    pageRatio.push({ iRatio: 0 });
  });
}

function renderPdf(data) {
  var container = document.querySelector('#viewer');

  container.querySelector('#page_num').innerHTML = 1;
  container.querySelector('#page_count').innerHTML = data.count;
  for (var index = 0; index < data.count; index++) {
    var div = document.createElement("div");
    div.style.margin = '10px auto';
    div.className = "page-viewer";
    div.id = "page" + (index);
    div.style.height = data.height;
    div.style.width = data.width;
    var img = document.createElement("img");
    img.src = data.png[index];
    div.appendChild(img);

    container.querySelector('#viewer_page').appendChild(div);
    if (index >= data.count - 1) {
      if (data.height < data.width) {
        window.parent.postMessage('landscape', "*");
      };
    pdfImageHeight =  data.height;
    // windows view part
    const divWin = document.createElement('div');
    divWin.width = div.width;
    divWin.id = "window";

    const imgWin = document.createElement('img');
    imgWin.id = "window-img";
    divWin.appendChild(imgWin);
    div.appendChild(divWin);

      div.info = "last-page";
      createObserver(container);
      document.querySelector('#viewer').style.display = 'flex';
      setTimeout(function () { 
        var ele = document.querySelector('#viewer_page');
        scrollHeight = ele.clientHeight; 
        mouseEvent(); 
      }, 500);

    }
  };
}
var getCrop = true;
var windowIsOn = false;
function windowOn() {
  if(document.querySelector('#window')){
    document.querySelector('#window').style.display = 'block';
    windowIsOn = true;
  }
}
function windowOff() {
  if(document.querySelector('#window')){
    document.querySelector('#window').style.display = 'none';
    windowIsOn = false
  
  }
}

var prevY = 0;
var scrollY = 0;
var scrollHeight = 0;
function updateView(newY, newScrollY){
  if (prevY && Math.abs(newY - prevY) < 4 && newScrollY == scrollY) { 
//    newY = prevY;
    return;
  }
  scrollY = newScrollY;
  prevY = newY;

  newY = newY <= 75 ?  75 : newY;
  if (getCrop) {
    getCrop = false;
    var cropY = (newY -75) +scrollY;;
    var page = parseInt(cropY / (pdfImageHeight));
    cropY = cropY - ((pdfImageHeight) * page);
    var url = host+'crop?fileToken=' + pdfFileToken+ "&page="+page+"&y=" + cropY; 

    axios.get(url,
    {
      headers: {
        'X-Auth-Token': 'eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9',

      }
    })
      .then(function (response) {
        if (response.data.res == "success") {
          var container = document.querySelector('#window-img');
          container.src = response.data.data;
          //          document.querySelector('#window').style.display = 'block'
        }
        document.querySelector('#window').style.top = ((newY + scrollY) - 75) +'px';
        getCrop = true;
      }).catch(error => {
        console.log(error)
        getCrop = true;
      })
  }
}
function mouseEvent() {
  document.querySelector('#viewer_page').onmousemove = event => {
    var newY = parseInt(event.clientY / 8) * 8;
    updateView(newY, scrollY)
/*    // Suivi de la position de la souris dans la console
    if (prevY && Math.abs(newY - prevY) < 8) { 
//      newY = prevY;
return;
    }
    document.querySelector('#window').style.top = newY + 'px';
    if (getCrop) {
      getCrop = false;
      var cropY = newY < 0 ? 0 : parseInt(newY);
      var url = 'http://api.picardev.fr:3000/crop?fileToken=' + pdfFileToken+ "&page=0"+"&y=" + cropY; 

      axios.get(url,
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
    }*/
    prevY = newY;

  }
}


document.addEventListener('DOMContentLoaded', function () {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.has('file')) {
    loadPdfFile(urlParams.get('file'));
  }

  if (urlParams.has('fileToken')) {
    viewPdf(urlParams.get('fileToken'));
  }
  $(document).keydown(function (event) {
    if (event.ctrlKey &&
      (event.keyCode === 67 ||
        event.keyCode === 86 ||
        event.keyCode === 85 ||
        event.keyCode === 117)) {
      return false;
    }
    if (event.keyCode == 123) { //Prevent F12
      return false;
    }
    if (event.ctrlKey && event.keyCode == 80) {
      return false;
    }
    if (event.ctrlKey && event.shiftKey && event.keyCode == 73) { //Prevent Ctrl+Shift+I        
      return false;
    }
  });

    
  document.querySelector('#viewer_page').addEventListener('scroll', function(e) {
    var ele = document.querySelector('#viewer_page');
    scrollHeight = ele.clientHeight; 
    if(ele.scrollTop != scrollY) {
      updateView(prevY, ele.scrollTop)
    }
  });
});
