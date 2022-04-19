// https://developer.mozilla.org/en-US/docs/Web/API/MediaStream
//* Contraintes pour la vidéo dynamisée par les valeurs des if/else ci-dessus.
// https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
 // liste les contraintes supportées par le navigateur
  // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getSupportedConstraints
//todo promblème N°1 les devices n'ont pas de name avant que l'on actualise la page au moins une fois..
//todo problème N°3 l'autorisation d'utiliser la caméra est demandé à chaque changement de caméra sur facebook
//todo masquer le vidéoBlock si erreur.


const app = {

  init:function() {

    console.log('init');
    app.camStreamer();
    app.listAllPictures();

    if (app.getcookie() === 'user=PhotoBooth'){
    app.userEnterWithCookie()
    document.querySelector('#errorMsg').removeAttribute('hidden');
    };

    if (app.isFacebookApp()){
    app.onFacebooKload()
    };

  },
  
  /**
   * Main Streamer 
   * Ask for media acces permission
   * Full stream logic
   * @return MediaStream
   */
  camStreamer:function() {
    console.log('camStreamer:function')

    app.takeCapture();
    app.resetCurrentCamName()

    let startStateElements = document.querySelectorAll('#catch, #post, #canvas, #videoElement, #stop, #errorMsg');
    let isCurentlyStreaming = document.querySelectorAll('#start, #post, #errorMsg, #canvas, #select');
    let userHasGrantedPermission = false;
      
    //* état d'affichage au départ.
    startStateElements.forEach(function(elements) {
    elements.setAttribute('hidden', true);
    });

    //* c'est parti pour le stream
    document.getElementById('start').addEventListener('click', () => {

    //* pré - initialisation des constraints on prépare un objet vide.
    const videoConstraints = {};
      
    // si pas de valeur passée dans le select on prend par défaut la cam frontale.
    if (select.value === ''){
    videoConstraints.facingMode = 'user'; 
    } else {
      videoConstraints.deviceId = { exact: select.value };
    };

    //* état final des constraints
    const constraints = {video: videoConstraints, audio: false};

    //* getUserMedia: demande d'autorisation d'accès à la caméra. 
    navigator.mediaDevices.getUserMedia(constraints).then(stream => {
    
    userHasGrantedPermission = true;

    if (userHasGrantedPermission === true && stream.active === true) {
    app.displayCurrentCamName();
    // tout est validé j'ai la permission + un stream actif -> je crée la liste de mes options select
    app.createListDevice(); 

    //* on a eu l'autorisation ET on a un stream on insère
    document.querySelector('video').srcObject = stream

    //* on affiche ou masque les boutons que l'on souhaite
    startStateElements.forEach(function(elements) {
    elements.removeAttribute('hidden');
    });

    isCurentlyStreaming.forEach(function(elements){
    elements.setAttribute('hidden', true)
    });

    //* ici on monitore en console toutes les valeurs de notre objet MediaStream en lecture
    const getStreamValues = stream.getTracks();
    
    //* actions quand on arrête le stream en cours
    document.querySelector('#stop').addEventListener('click', () => { 
    document.querySelector('#start').removeAttribute('hidden');
    document.querySelector('#select').removeAttribute('hidden');

    app.resetCurrentCamName();
    app.resetCanvasContext();

    app.stopCurrentStreamAndClearTracks(getStreamValues);

    //* on réinitialise l'état de l'affichage du départ.
    startStateElements.forEach(function(elements) {
    elements.setAttribute('hidden', true);
      });//end foreach
    });

  };//end if is grantedCam and streamActive

  })//end stream GetUSerMedia

  .catch(function(err) {

      if (err.name === 'NotReadableError' || err.message === 'Could not start video source'){
        let errorName =  'L\'autorisation d\'accès à votre caméra n\'est pas été autorisé :'
        let errorMessage = 'la caméra ne peut pas se lancer'
        app.dislayError(errorName, errorMessage);
      } else {
        app.dislayError(' Erreur dans camStreamer ' + err.name + ": " + err.message + ' ');
      }
      
  });

  });//end click start listener
  
  },

  /**
   * Find media devices in current User devices
   * Filter on videoInput kind
   * Append media vidéo elements in select values
   * @return select & options
   */
  createListDevice:function () {
    //*je resete la liste avant de la contruire
    app.resetMediaListOption();
      // je récupère les devices vidéo et audio dipo sur mon péréphérique
      navigator.mediaDevices.enumerateDevices()
      .then(function(devices) {
          let count = 1;

          devices.forEach(function(device) {  

              if (device.kind === 'videoinput') {   

              let select = document.getElementById('select'); 
              let option = document.createElement('option');

              option.value = device.deviceId;

              let label = device.label; 

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

      .catch(function(err) {
          //alert('impossible d\'initialiser les péréfériques')
          alert(' Erreur dans la listDevice ' + err.name + ": " + err.message);
      });  
  },

  /**
   * Allow user to capture picture from current stream
   * Append capture in canvas elment
   * @return canvas 
   * @return dataUrl from canva
   */
  takeCapture:function () {
  console.log('takeCapture:function')
 
    document.querySelector('#reset').setAttribute('hidden', true);
    document.querySelector('#catch').setAttribute('hidden', true);

    document.querySelector('#catch').addEventListener('click', () => {
    let ElementsToHide = document.querySelectorAll('#canvas, #post, #reset');
    ElementsToHide.forEach(function(elements) {
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
    
    //* je crée un canvas.toDataURL pour avoir un format encodé 'postable' et persistable en BDD.
    document.querySelector('#post').addEventListener("click", () => {
    let dataURL = canvas.toDataURL('image/jpeg', 1.0);
    console.log(dataURL);

    //*j'apelle ma fonction api POST au clic sur Post My picture et le lui passe mon canvas.
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
   * Stop all current stream tracks
   * loop on MediaStream and use native MediaStream Object stop() function
   * @param {MediaStream} 
   */
  stopCurrentStreamAndClearTracks:function(streamTracks){
    streamTracks.forEach(function(track) {
      track.stop();
    });
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
   * Reset all Media Devide select Options
   */
  resetMediaListOption:function(){
    let options = document.querySelectorAll('#select option');
        options.forEach(element => element.remove());
  },

  /**
   * Get all MediaStream info and display in console
   * @param {MediaStream}
   */
  monitorCurrentStremValues:function(getStreamValues){
    //* loop on MediaStream and use native MediaStream Object

    getStreamValues.forEach(function(track) {
      //* on initialise nos variables avec les valeurs de retour de nos méthodes propres à MediaStream
      let trackSettings = track.getSettings();
      let trackCapabilities = track.getCapabilities();
      let trackConstraints = track.getConstraints();

          //* On boucle sur les paires clé/valeur de chacun de nos objets    
          for (const [key, value] of Object.entries(trackSettings)) {
              console.log('TRACK SETTINGS ' + key + ' : ' + value);
          };
          
          for (const [key, value] of Object.entries(trackCapabilities)) {
              console.log('TRACK CAPABILITIES ' + key + ' : ');
              //si on ajoute un texte avant value il n'affiche pas les valeurs json idexées dans les clés ! 
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
  console.log('postNewPicture:function')

    //* je crée une date
    let createdAt = new Date();

    //* ici je préprare le contenu des datas à poster.
    //!  ils doivent correspondre aux propriétés non nullables de mon entité.
    const data = { 
        picture: dataURL,
        createdAt: createdAt
    };

    //* préparation des Headers
    const httpHeaders = new Headers();
    httpHeaders.append('Content-Type', 'application/json');
    
    //* route de mon back-end symfony
    //const apiRootUrl = 'https://photoboothback.simschab.fr/api';
    const apiRootUrl = 'http://127.0.0.1:8000/api';

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
        console.log('second then après post des datas, je resete le contenu de la div pour réafficher la liste avec le dernière photo prise ')
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
   * Display all pictures from DataBase
   * Fetch data from API
   * Append data.entries to img.src
   * @method GET
   */
  listAllPictures: function () {
    console.log('listAllPictures: function')
      //const apiRootUrl = 'https://photoboothback.simschab.fr/getpictures'
      const apiRootUrl = 'http://127.0.0.1:8000/getpictures'

      let config = {
          method: 'GET',
          mode: 'cors',
          cache: 'no-cache'
      };

      fetch (apiRootUrl, config)
      .then(response => {
          return response.json();
      })
      .then(data => {
          for(value in data) {
              output = document.getElementById('canvasImg')
              output.innerHTML += `
              <img id="canvasImg" src="${data[value].picture}" alt="image"/>  
            `
          }
      });
  },
  
  /**
   * Reset all canvas content
   */
  resetCanvasContext:function(){
  console.log('resetCanvasContext:function')

  let ElementsToHide = document.querySelectorAll('#canvas, #post, #reset');

  ElementsToHide.forEach(function(elements) {
  elements.setAttribute('hidden', true)  
  });

  document.querySelector('#catch').removeAttribute('hidden')
  let canvas = document.querySelector('canvas'); 
  let context = canvas.getContext('2d');
  context.clearRect(0, 0, canvas.width, canvas.height)
  },

  /**
   * Hide all video stream features
   * Display POST confirmation message 
   */
  resetMainVideoDiv:function(){
      let MainVideoDiv = document.getElementById('videoBlock');
      let postErrorMessage = document.getElementById('errorMsg');
      MainVideoDiv.classList.add('hidden');
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
      errorElements.forEach(function(elements) {
      elements.removeAttribute('hidden');
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
   * Detect Facebook User Agent
   * @returns bool
   */
  isFacebookApp : function() {
    console.log('isFacebookApp')
      var ua = navigator.userAgent || navigator.vendor || window.opera;
      return (ua.indexOf("FBAN") > -1) || (ua.indexOf("FBAV") > -1);
  },

  /**
   * What we do when we Detect Facebook User Agent
   */ 
  onFacebooKload: function() {

      document.getElementById('facebookAlert').innerHTML += `
          <div class="alert alert-danger" role="alert" id="facebookAlert">
          <b>
          <span style='font-size:1.5rem;'>&#128580;</span>
          Arf ! On est sur un navigateur limité.</b>
          <span style='font-size:2rem;'>👆</span>
          <br>
          <hr>
          En cas de soucis au lancement des caméras<br>
          clique sur les 
          <div class = "points">...</div> 
          en haut à droite et choisir :<br>
          <hr>
          <b>ouvir dans le navigateur (Chrome - Safari - Firefox).</b>
          Regarde le doigt <span style='font-size:1.2rem;'>😋</span>
          </div>
      `
  },

};
  
document.addEventListener('DOMContentLoaded', app.init)