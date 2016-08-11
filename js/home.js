var photoGallery = null;
var overlayPageIndex = null;

var loadPhotos = function() {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'https://api.imgur.com/3/gallery/search/top/month?q=bridge', true);
  xhr.setRequestHeader("Authorization", "Client-ID 1b4ce4b3fcdb1b4");
  xhr.onload = function(e) {
    var data = JSON.parse(this.response);
    console.log("The photos data is " + e);
    console.log(data);
    photoGallery = new Gallery();
    photoGallery.setData(data.data);
    photoGallery.addImageSet("photo-gallery");
  }
  xhr.send();
}

var loadResource = function(resource, ele) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', resource.replace("http:", "https:"), true);
  xhr.responseType = 'blob';
  document.getElementsByClassName('lightbox')[0].getElementsByClassName('loading')[0].style.display = 'block';
  document.getElementsByClassName('lightbox')[0].getElementsByClassName('lightbox-image')[0].style.display = 'none';
  xhr.onload = function(e) {
    document.getElementsByClassName('lightbox')[0].getElementsByClassName('loading')[0].style.display = 'none';
  document.getElementsByClassName('lightbox')[0].getElementsByClassName('lightbox-image')[0].style.display = 'block';
  }
  xhr.onreadystatechange = function() {
    console.log(xhr);
    if (xhr.readyState==4 && xhr.status==200) {
        var blob = new Blob([xhr.response], {
            type: xhr.getResponseHeader("Content-Type")
        });
        var imgUrl = URL.createObjectURL(blob);
        var a = document.createElement("img")
        a.src = imgUrl;
        ele.getElementsByClassName('lightbox-image')[0].src = imgUrl;
      }
  }
  xhr.send();
}

console.log(document.readyState);

let stateCheck = setInterval(() => {
  if (document.readyState === 'complete') {
    clearInterval(stateCheck);
    loadPhotos();
    //https://api.imgur.com/3/gallery/random/random/
  }
}, 100);

var ImageInstance = function(url, width, height, title, description) {
  this.imageURL = new URL(url);
  this.imageWidth = width || 0;
  this.imageHeight = height || 0;
  this.imageTitle = new String(title);
  this.imageDescription = new String(description);
  
  this.getURL = function() {
    return this.imageURL.href;
  }
  
  this.getImageWidth = function() {
    return this.imageWidth || 0;
  }
  
  this.getImageHeight = function() {
    return this.imageHeight || 0;
  }
  
  this.getImageTitle = function() {
    return this.imageTitle || "";
  }
  
  this.getImageDescription = function() {
    return this.imageDescription || "";
  }
}

var Gallery = function() {
  this.data = [];
  this.start = 0;
  this.end = 0;
  
  this.getData = function() {
    return this.data;
  }
  
  this.setData = function(data) {
    this.start = this.end;
    var newData = [];
    for(next in data) {
      if (typeof data[next].is_album != 'undefined' && data[next].is_album != true) {
        newData.push(data[next]);
      }
    }
    this.data = this.data.concat(newData);
    this.end = this.data.length;
  }
  
  this.imageTemplate = function(width, height, index) {
    var isLandscapeImage = width > height;
    
    let className = isLandscapeImage ? "horizontal" : "vertical";
    className = "image-box " + className;
    
    var imageBox = addNode('div', [{name: 'className', value: className}]);
    
    var imageTitle = addNode('div', [{name: 'className', value: 'image-title limit-characters'}]);
    
    imageBox.appendChild(imageTitle);
    
    var imageContainer = addNode('div', [{name: 'className', value: 'image-container'}]);
    
    var verticallyCenter = addNode('div', [{name: 'className', value: 'center-vertical'}]);
    
    var imageElement = document.createElement('img');
    imageElement.className = "center-horizontal";
    imageElement.setAttribute('data-index', index);
    imageElement.setAttribute('data-orientation', isLandscapeImage ? "landscape" : "portrait");
    
    verticallyCenter.appendChild(imageElement);
    imageContainer.appendChild(verticallyCenter);
    
    imageBox.appendChild(imageContainer);
    
    return imageBox;
  }
  
  this.addImageSet = function(className) {
    let parentEle = document.getElementsByClassName(className)[0];
    let dataSet = this.data;
    for(next in dataSet) {
      let template = this.imageTemplate(dataSet[next].width || 0, dataSet[next].height || 0, next);
      let tempImageInstance = null;
      try {
        tempImageInstance = new ImageInstance(dataSet[next].link, dataSet[next].width, dataSet[next].height, dataSet[next].title, dataSet[next].description);
      } catch(e) {
        console.log(e);
        continue;
      }
      
      var titleText = document.createTextNode(tempImageInstance.getImageTitle().toString());
      template.getElementsByClassName("image-title")[0].appendChild(titleText);
      
      let imgElement = template.getElementsByTagName("img");
      imgElement.valueOf()[0].alt = (document.createTextNode(tempImageInstance.getImageDescription().toString())).data;
      imgElement.valueOf()[0].src = tempImageInstance.getURL();
      
      parentEle.appendChild(template);
    }
  }
}

var addOverlay = function(e) {
  
  var lightboxElem = document.createElement('div');
  lightboxElem.onclick = closeLightBox;
  var index = e.getAttribute('data-index');
  overlayPageIndex = index;
  var orientation = e.getAttribute('data-orientation');
  var item = photoGallery.getData()[index];
  var isLandscapeImage = item.width > item.height;
  lightboxElem.className = isLandscapeImage ? "horizontal" : "vertical";
  lightboxElem.className = "lightbox " + lightboxElem.className;
  lightboxElem.style.display = "none";
  
  var contentElem = addNode('div', [{name: 'className', value: 'content'}]);
  lightboxElem.appendChild(contentElem);
  
  var prevImgElem = addNode('div', [{name: 'className', value: 'prev-image center-vertical'}]);
  prevImgElem.onclick = viewPreviousImage;
  //prevImgElem.appendChild(document.createTextNode("<"));
  prevImgElem.appendChild(addNode('img', [{name: 'src', value: './icons/left.png'}, {name: 'alt', value: '<'}, {name: 'className', value: 'icon'}]));
  
  var nextImgElem = addNode('div', [{name: 'className', value: 'next-image center-vertical'}]);
  nextImgElem.onclick = viewNextImage;
  //nextImgElem.appendChild(document.createTextNode(">"));
  nextImgElem.appendChild(addNode('img', [{name: 'src', value: './icons/right.png'}, {name: 'alt', value: '>'}, {name: 'className', value: 'icon'}]));
  
  var imgContainerElem = addNode('div', [{name: 'className', value: 'image-container'}]);
  
  contentElem.appendChild(prevImgElem);
  contentElem.appendChild(imgContainerElem);
  contentElem.appendChild(nextImgElem);
  
  var centerVElem = addNode('div', [{name: 'className', value: 'center-vertical'}]);
  imgContainerElem.appendChild(centerVElem);
  
  var loadingItem = addNode('div', [{name: 'className', value: 'loading'}]);
  loadingItem.appendChild(document.createTextNode(" "));
  centerVElem.appendChild(loadingItem);
  
  var closeLightboxItem = addNode('div', [{name: 'className', value: 'close-lightbox'}]);
  //closeLightboxItem.appendChild(document.createTextNode("x"));
  closeLightboxItem.appendChild(addNode('img', [{name: 'src', value: './icons/close.png'}, {name: 'alt', value: 'x'}, {name: 'className', value: 'icon'}]));
  centerVElem.appendChild(closeLightboxItem);
  
  var imgElem = addNode('img', [{name: 'className', value: 'center-horizontal lightbox-image'}]);
  imgElem.src = "";
  centerVElem.appendChild(imgElem);
  
  document.getElementsByClassName('overlay')[0].appendChild(lightboxElem);
  
  return lightboxElem;
}

var addNode = function(nodeType, attributes) {
  let node = document.createElement(nodeType);
  let indx = 0;
  for(indx in attributes) {
    node[attributes[indx].name] = attributes[indx].value;
  }
  return node;
}

var resetOverlay = function() {
  var x = document.getElementsByClassName('overlay')[0];
  x.removeChild(x.firstElementChild)
}

var openLightBox = function(e) {
  var event = e || window.event;
  var ele = event.target || event.srcElement;
  //let lightbox = document.getElementsByClassName('lightbox')[0];
  let lightbox = addOverlay(ele);
  lightbox.style.display = lightbox.style.display == 'none' ? 'block' : 'none';
  loadResource(ele.src, lightbox);
}

var closeLightBox = function() {
  overlayPageIndex = null;
  resetOverlay();
}

var viewPreviousImage = function(event) {
  event.stopPropagation();
  let lightbox = document.getElementsByClassName('lightbox')[0];
  if (overlayPageIndex > 0) {
    overlayPageIndex--;
  } else {
    overlayPageIndex = photoGallery.end - 1;
  }
  let data = photoGallery.getData()[overlayPageIndex];
  let isLandscapeImage = data.width > data.height
  lightbox.className = lightbox.className.replace(/horizontal|vertical/g, isLandscapeImage ? "horizontal" : "vertical");
  loadResource(data.link, lightbox);
}

var viewNextImage = function(event) {
  event.stopPropagation();
  let lightbox = document.getElementsByClassName('lightbox')[0];
  if (overlayPageIndex < photoGallery.end - 1) {
    overlayPageIndex++;
  } else {
    overlayPageIndex = 0;
  }
  let data = photoGallery.getData()[overlayPageIndex];
  let isLandscapeImage = data.width > data.height
  lightbox.className = lightbox.className.replace(/horizontal|vertical/g, isLandscapeImage ? "horizontal" : "vertical");
  loadResource(data.link, lightbox);
}
