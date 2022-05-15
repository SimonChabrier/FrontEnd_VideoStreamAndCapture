// https://developer.mozilla.org/en-US/docs/Web/API/MediaStream
// Contraintes pour la vidéo
// https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
// Contraintes supportées par le navigateur
// https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getSupportedConstraints

//* Supported on Mobile Android & iOS
//* Supported on Desktop OSX Windows Linux
//* Supported on Chrome Safari Mozilla Opera ChromeDevelopper Edge Opera Gx

//todo exploiter console.log('mediaDevices' in navigator) === true) {on peut lancer la logique du stream ou sinon retourner une info.}
 
const app = {

  init:function() {

    console.log('init');
    app.getAllPictures();

    //app.browserSuportedConstraints();

    // if (app.getcookie() === 'user=PhotoBooth'){
    // app.userEnterWithCookie()
    // document.querySelector('#errorMsg').removeAttribute('hidden');
    // };
  },

/**
 * Get all Pictures from app Back-End
 * @method GET
 */
getAllPictures: function(){

  app.streamInit();
  app.currentBrowserCheck();

  const displayedMap = app.mainMapInit();

  //const apiRootUrl = 'https://photoboothback.simschab.fr/api/get'
  const apiRootUrl = 'http://127.0.0.1:8000/api/get'

  let config = {
      method: 'GET',
      mode: 'cors',
      cache: 'no-cache'
  };

  fetch(apiRootUrl, config)
    .then(response => {
        return response.json();
    })
    .then(data => {
      app.mapMarkersInit(data, displayedMap);
    });
},

/**
 * @returns Leaflet Map
 */
mainMapInit: function() {
  var map = L.map('map').setView([46.227638, 2.213749], 6);
  map.addControl(new L.Control.Fullscreen());
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {    
  }).addTo(map);

  return map
},

/**
 * Create Markers on Map
 * @param {object} map 
 * @param {object} data
 */                                                                                                                                                                                                             
mapMarkersInit: function (data, map)
{ 
  for(item = 0; item < data.length; item ++) {

    let lat = data[item].lat;
    let lng = data[item].lng;
  
    if (lat === null || lng === null) {
      //set random coords values
      lat = app.getRandomCoords(43, 47, 20);
      lng = app.getRandomCoords(0, 7, 10);
    }

    // Append picture in Map Popup
    const popUpPicture =  ` <img class = "popImg" src="http://127.0.0.1:8000/media/cache/portrait/assets/upload/pictures/${data[item].pictureFile}.webp" type="image/webp" alt="image"/>`
    //const popUpPicture =  ` <img class = "popImg"  src="https://photoboothback.simschab.fr/media/cache/portrait/assets/upload/pictures/${data[item].pictureFile}.webp" type="image/webp" alt="image"/>`
    const marker = L.marker([lat, lng], {title: data[item].id})
    .addTo(map)
    .bindPopup(popUpPicture)
      
    const displayedPicture = document.querySelector('#canvasImg');
    displayedPicture.innerHTML += ` <img class = "divImg" id = "${data[item].id}" src="http://127.0.0.1:8000/media/cache/portrait/assets/upload/pictures/${data[item].pictureFile}" type="image/jpeg alt="image"/>`  
    //displayedPicture.innerHTML += ` <img class = "divImg" id = "${data[item].id}" src="https://photoboothback.simschab.fr/media/cache/portrait/assets/upload/pictures/${data[item].pictureFile}" type="image/jpeg alt="image"/>`
    
    // Store each new marker item in an Array
    const markersArray = []
    markersArray.push(marker);

    // Open current Maker PopUp
    displayedPicture.addEventListener("mouseover", event => { 
      app.appendOpenCurrentMarkerPopup(markersArray, event)
    });

    //Close current Maker PopUp
    displayedPicture.addEventListener("mouseout", event => { 
      app.appendCloseCurrentMarkerPopUp(markersArray, event)
    });
  }
},

/**
 * @param {Array} markersArray 
 * @param {MouseEvent} event 
 */
appendOpenCurrentMarkerPopup:function (markersArray, event) {

let currentPictureId = event.target.getAttribute('id')  
for (let item in markersArray){
  let currentMarkerId = markersArray[item].options.title;
  if (currentMarkerId == currentPictureId){
    setTimeout(() => {
      markersArray[item].openPopup();
    }, "300")
  };
}
},

/**
 * @param {Array} markersArray 
 * @param {MouseEvent} event 
 */
appendCloseCurrentMarkerPopUp:function (markersArray, event){

let currentPictureId = event.target.getAttribute('id')  
for (let item in markersArray){
  let currentMarkerId = markersArray[item].options.title;
  if (currentMarkerId == currentPictureId){
    setTimeout(() => {
      markersArray[item].closePopup();
    }, "1500")
  };
}
},

/**
 * Stream init and start stream action on mouse click
 */
streamInit:function() {
  
  app.getGeoLoc();
  app.takeCapture();
  app.resetCurrentCamName()

  const startStateElements = document.querySelectorAll('#catch, #post, #canvas, #videoElement, #stop, #errorMsg');
  const isCurentlyStreaming = document.querySelectorAll('#start, #post, #errorMsg, #canvas, #select');
  let userHasGrantedPermission = false;
    
  // Display state if no stream active.
  startStateElements.forEach(function(elements) {
  elements.setAttribute('hidden', true);
  });

  //Start Stream
  document.getElementById('start').addEventListener('click', () => {
    app.appendStream(startStateElements, userHasGrantedPermission, isCurentlyStreaming)
  });

},

/**
 * @param {NodeList} isCurentlyStreaming 
 * @param {Boolean} userHasGrantedPermission 
 * @param {NodeList} startStateElements 
 */
appendStream: function(startStateElements, userHasGrantedPermission, isCurentlyStreaming){

  // set video Constrainst.
  const videoConstraints = {
  width: { min: 320, ideal: 640, max: 640 },
  height: { min: 240, ideal: 480, max: 480},
  aspectRatio: { ideal: 1.7777777778 }
  };
    
  // if no selected value in devices liste we use default front device camera. else we use selected device.
  if (select.value === ''){
  videoConstraints.facingMode = 'user'; 
  } else {
    videoConstraints.deviceId = { exact: select.value };
  };

  // final state Constraints
  const constraints = {video: videoConstraints, audio: false};
  
  // getUserMedia: Ask here user to granted Camera use. 
  navigator.mediaDevices.getUserMedia(constraints).then(stream => {
  
  userHasGrantedPermission = true;

  if (userHasGrantedPermission === true && stream.active === true) {
  
  // display curent cam streaming name on view
  app.displayCurrentCamName();

  // if => return true so We have userGranted and a active stream => we create select devices list
  app.createListDevice(); 

  // Check browser because lot of navigators need a user gesture to allow camera play a stream
  // in Index.html we must add playsinline in <video></video> to prevent default full screen video diplaying on Ios devices
  if (navigator.userAgent.indexOf("Chrome") !== -1){
    document.querySelector('video').autoplay = true;
    document.querySelector('video').controls = false;
  } else {
    document.querySelector('video').autoplay = false;
    document.querySelector('video').controls = true;       
  };
  
  // We have user Granted AND a stream objet => we src stream in <video></video>
  document.querySelector('video').srcObject = stream

  // We display or hide elements we need user can see when streamin
  startStateElements.forEach(function(elements) {
  elements.removeAttribute('hidden');
  });

  isCurentlyStreaming.forEach(function(elements){
  elements.setAttribute('hidden', true)
  });

  const streamActiveTracks = stream.getTracks();
  // todo soucis de compatibilité firefox sur si appelée sur Mobile
  // app.monitorCurrentStremValues(getStreamValues);

  //Dislayed view state on strop current stream
  document.querySelector('#stop').addEventListener('click', () => { 
    
  document.querySelector('#start').removeAttribute('hidden');
  document.querySelector('#select').removeAttribute('hidden');

  app.resetCurrentCamName();
  app.resetCanvasContext();

  app.stopCurrentStreamAndClearTracks(streamActiveTracks);

  //* on réinitialise l'état de l'affichage du départ.
  startStateElements.forEach(elements => {
  elements.setAttribute('hidden', true);
    });
  });
};//end if is grantedCam and streamActive
})//end stream GetUSerMedia

.catch(err => {

    if (err.name === 'NotReadableError' || err.message === 'Could not start video source'){
      let errorName =  'L\'autorisation d\'accès à votre caméra n\'est pas été autorisé :'
      let errorMessage = 'la caméra ne peut pas se lancer'
      app.dislayError(errorName, errorMessage);
    
    } 
    if (err.name === 'NotReadableError' || err.message === 'Permission denied undefined'){
      let errorName =  'L\'autorisation d\'accès à votre caméra rencontre un problème :'
      let errorMessage = 'le type de l\'erreur n\'a pas été précisée !'
      app.dislayError(errorName, errorMessage);
    
    } else {
      app.dislayError(' Erreur dans streamInit ' + err.name + ": " + err.message + ' ');
    }
    
});
},

/**
 * Find media devices in current User devices
 * Filter on videoInput kind
 * Append media each vidéo elements in select values
 * @return select & options
 */
createListDevice:function () {
  //reset previous createdList
  app.resetListDevices();
    // get all viceo media device available on current user support
    navigator.mediaDevices.enumerateDevices()
    .then(devices => {
        let count = 1;
        //loop on each device / filter by type / construct list option
        devices.forEach(device => {  

          if (device.kind === 'videoinput') {   

          let select = document.getElementById('select'); 
          let option = document.createElement('option');

          option.value = device.deviceId;

          let label = device.label; 
          // if navigator return a empty device.label value we set a default value to display typeOf device 
          if (device.label === ''){
            label = device.kind
          }

          let camName = document.createTextNode(label + ' N° '+ `${count++}`);
          select.appendChild(option); // j'attache mes options à mon element select
          option.appendChild(camName);  

          }
              //console.log(device.kind + ": " + device.label + " id = " + device.deviceId);   
        });
    })

    .catch(err => {
        alert(' Erreur dans la listDevice ' + err.name + ": " + err.message);
    });  
},

/**
 * Reset all Media Devide select Options
 * Call on start of CreateListDevice
 */
resetListDevices:function(){
  let options = document.querySelectorAll('#select option');
      options.forEach(element => element.remove());
},

/**
 * Allow user to capture picture from current stream
 * Append capture in canvas elment
 * @return canvas 
 * @return dataUrl from canva
 */
takeCapture:function () {

  document.querySelector('#reset').setAttribute('hidden', true);
  document.querySelector('#catch').setAttribute('hidden', true);

  document.querySelector('#catch').addEventListener('click', () => {
  let ElementsToHide = document.querySelectorAll('#canvas, #post, #reset');
  ElementsToHide.forEach(elements => {
  elements.removeAttribute('hidden');
  });

  document.querySelector('#catch').setAttribute('hidden', true)

  let video = document.querySelector('video');
  let canvas = document.querySelector('canvas');
  canvas.width = video.offsetWidth;
  canvas.height = video.offsetHeight;

  canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);

  });

  document.querySelector('#reset').addEventListener('click', () => {
  app.resetCanvasContext();
  }); 
  
  //Create a base64 code from canvas current content to share on API POST and process it on App BackEnd in JpegConverterService using Doctrine Listeners
  document.querySelector('#post').addEventListener("click", () => {
  let dataURL = canvas.toDataURL('image/jpeg', 1.0);
  app.postNewPicture(dataURL);
  }, false); 
  
},

/**
 * Display current select video device name
 * @return video device name innerHTML
 */
displayCurrentCamName:function(){
  let sel = document.getElementById('select');
  let value = sel.options[sel.selectedIndex].text;
  document.getElementById('currentCamName').removeAttribute('hidden');
  document.getElementById('currentCamName').innerHTML = 'Streaming On : ' + value;
},

/**
 * Reset current streaming cam name
 * @return '' innerHTML
 */
  resetCurrentCamName:function(){
  document.getElementById('currentCamName').setAttribute('hidden', true)
  document.getElementById('currentCamName').innerHTML = '';
},

/**
 * Stop all current stream tracks
 * loop on MediaStream and use native MediaStream Object stop() function
 * @param {MediaStream} 
 */
stopCurrentStreamAndClearTracks:function(streamTracks){
  streamTracks.forEach(track => {
    track.stop();
  });
},

/**
 * Get all MediaStream info and display in console
 * @param {MediaStream}
 */
monitorCurrentStremValues:function(getStreamValues){
  // loop on MediaStream and use native MediaStream Object
  //todo soucis de compatibilité firefox Mobile
  getStreamValues.forEach(track => {
    let trackSettings = track.getSettings();
    // incompatible in FireFox !
    // let trackCapabilities = track.getCapabilities();
    let trackConstraints = track.getConstraints();

        // We loop on the key/value pairs of each of our objects   
        for (const [key, value] of Object.entries(trackSettings)) {
            console.log('TRACK SETTINGS ' + key + ' : ' + value);
        };
        
        for (const [key, value] of Object.entries(trackCapabilities)) {
            console.log('TRACK CAPABILITIES ' + key + ' : ');
            // if we add a text before value it does not display the json values ​​indexed in the keys!
            console.log(value);
        };

        for (const [key, value] of Object.entries(trackConstraints)) {
            console.log('TRACK CONSTRAINTS ' + key + ' : ' + value);
        };
  });
},

/**
 * Fetch and POST data on https://photoboothback.simschab.fr/api
 * @param {text} dataURL from canvas
 * @return {json}
 * @method POST
 */
postNewPicture:function(dataURL) {

  let lat = document.getElementById('lat').innerHTML
  let lng = document.getElementById('lng').innerHTML

  //* ici je préprare le contenu des datas à poster.
  const data = { 
      picture: dataURL,
      lat: lat,
      lng: lng
  };

  //* préparation des Headers
  const httpHeaders = new Headers();
  httpHeaders.append('Content-Type', 'application/json');
  
  //* route de mon back-end symfony
  //const apiRootUrl = 'https://photoboothback.simschab.fr/api/post';
  const apiRootUrl = 'http://127.0.0.1:8000/api/post';

  //* Je poste sur la route API 
  const fetchOptions = 
  {
  method: 'POST', // or 'POST --> doit correspondre à la mathode délcarée sur la route symfony'
  mode : 'cors',
  cache : 'no-cache',
  headers: httpHeaders,
  body: JSON.stringify(data),
  }

  fetch(apiRootUrl , fetchOptions)

  .then(response => {

      if (response.status !== 201) 
      {
          throw 'Erreur avec la requête'; 
      }
      return response.json();
      }
  )
  .then(function(){

      app.resetpictureDiv();
      app.setCookie();
      app.resetMainVideoDiv();
      app.resetCanvasContext();
      document.querySelector('#errorMsg').removeAttribute('hidden');
      
      setTimeout(function() {
        location.reload();
      }, 2000);
  })
  .catch(function(errorMsg){
      console.log(errorMsg)
  });
},


/**
 * Get Geolocation
 * Ask user to Allow GeaoLocalisatin
 */
  getGeoLoc: function(){

  if(!navigator.geolocation) {

  alert('La géolocalisation n\'est pas supportée mais ce n\'est pas primordial !');

  } else {

    navigator.geolocation.getCurrentPosition(position => {
    const { latitude, longitude } = position.coords;
    console.log(latitude)
    console.log(longitude)
    //il faut travailler pour placer les coordonnées dans le code html et les récupèrer ensuite (je ne peux rien sortir d'ici).
    document.getElementById('lat').innerHTML += latitude
    document.getElementById('lng').innerHTML += longitude
  
    }); 
  }
},

/**
 * Random coordonates générator
 * @param {int} from 
 * @param {int} to 
 * @param {int} fixed 
 * @returns 
 */
getRandomCoords: function(from, to, fixed) {
return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
//.toFixed() returns string, so ' * 1' is a trick to convert to number
},

/**
 * Reset all canvas content
 */
resetCanvasContext:function(){

let elementsToHide = document.querySelectorAll('#canvas, #post, #reset');

elementsToHide.forEach(function(elements) {
elements.setAttribute('hidden', true)  
});

document.querySelector('#catch').removeAttribute('hidden')
let canvas = document.querySelector('canvas'); 
let context = canvas.getContext('2d');
context.clearRect(0, 0, canvas.width, canvas.height)
},

/**
 * Hide all video stream features
 * Display picture POST confirmation message in view
 */
resetMainVideoDiv:function(){
    let mainVideoDiv = document.getElementById('videoBlock');
    let postErrorMessage = document.getElementById('errorMsg');
    mainVideoDiv.classList.add('hidden');
    postErrorMessage.classList.remove('hidden');
    postErrorMessage.style.background = "#298838";
    postErrorMessage.innerHTML += ' -----> Image ajoutée <----- '
},

/**
 * Reset all images displayed
 * on each API GET request event
 */
resetpictureDiv:function(){
console.log('resetpictureDiv:function')
    document.getElementById('canvasImg').innerHTML = '';
},

/**
 * Reset errorMsg content
 */
resetErrorPostMessage:function(){
document.getElementById('errorMsg').innerHTML = '';
},

/**
* Display all navigator supported info
* Actually noy used but ready to use if needed
*/
browserSuportedConstraints:function () {   
    let supportedConstraints = navigator.mediaDevices.getSupportedConstraints();
    let constrainsList = document.getElementById('constraintList');
    let constraintInfo = document.createTextNode(' ---- Est supporté ---- ');
    constrainsList.appendChild(constraintInfo);

    for (let constraint in supportedConstraints) {
        if (supportedConstraints.hasOwnProperty(constraint)) {
        let liElement = document.createElement("li");
        liElement.innerHTML = "<code>" + constraint + "</code>";
        constrainsList.append(liElement);
        }
    }
},

/**
 * 'Template' for errors message
 * @param {text} errorName 
 * @param {text} errorMessage 
 */
dislayError: function(errorName, errorMessage) {
console.log('dislayError: function') 
    // Pour le moment il n'y en a qu'un mais on est prêt à en ajouter entre d'autres si besoin.
    let errorElements = document.querySelectorAll('#errorMsg')
    errorElements.forEach(element => {
    element.removeAttribute('hidden');
    });
    document.getElementById('errorMsg').innerHTML += '<p>' + errorName + '<br>' + errorMessage + '</p>';
},

/**
 * Create a 1 day life cookie
 * If user post then user get the cookie and
 * can not post again for 1 day
 */
setCookie:function () {
let date = new Date(Date.now() + 86400000); //86400000ms = 1 jour
date = date.toUTCString();
let path = window.location.origin;
document.cookie = 'user=PhotoBooth; path=' + path + '; expires=' + date; 
},

/**
 * Check if user have the cookie
 * @returns bool
 */
getcookie:function() {  
    let decodedCookie = decodeURIComponent(document.cookie);
    return decodedCookie
},

/**
 * What wa do when user have the cookie
 */
userEnterWithCookie :function() {
    let postErrorMessage = document.getElementById('errorMsg');
    let homeSelect = document.getElementById('divSelect');
    let homeStart = document.getElementById('start');

    homeSelect.classList.add('hidden');
    homeStart.classList.add('hidden');

    postErrorMessage.classList.remove('hidden');
    postErrorMessage.innerHTML += 'Vous avez déjà posté une photo ! <br> revenez demain pour en poster une autre'
},

/**
 * Detect if Smartphone Facebook internal browser
 * and return a user info message
 * prevent for compatibility limits
*/
currentBrowserCheck :function() {
  console.log('windowMobileCheck')
    //* Facebook Browser Detection on Smartphone
    var ua = navigator.userAgent || navigator.vendor || window.opera;

    if((ua.indexOf("FBAN") > -1) || (ua.indexOf("FBAV") > -1)){

    document.getElementById('facebookAlert').innerHTML += `

      <div class="alert alert-primary" role="alert" id="facebookAlert">
      <b>
      <span>&#129310;</span>
      FaceBook Info</b>
      <span>&#129310;</span>
      <br>
      <hr>
      En cas de soucis au lancement des caméras<br>
      clique sur les 
      <div class = "points">...</div> 
      en haut à droite et choisir :<br>
      <hr>
      <b>ouvir dans le navigateur (Chrome - Safari - Firefox).</b>
      Regarde le doigt <span style='font-size:1.2rem;'>😋</span>
      <br><br>
      <button type="button" class="btn btn-primary" id="fbInfo">Fermer</button>
      </div>
    `

    document.querySelector('#facebookAlert').removeAttribute('hidden');
    document.querySelector('#smartAlert').setAttribute('hidden', false);

    document.getElementById('fbInfo').addEventListener('click', () => {
    document.querySelector('#facebookAlert').setAttribute('hidden', true);
    });
  }
},


};


  
document.addEventListener('DOMContentLoaded', app.init)