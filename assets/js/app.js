// https://developer.mozilla.org/en-US/docs/Web/API/MediaStream
// Contraintes pour la vidéo dynamisée par les valeurs des if/else ci-dessus.
// https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
// liste les contraintes supportées par le navigateur
// https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getSupportedConstraints

//* Supported on Mobile Android & iOS
//* Supported on Desktop OSX Windows Linux
//* Supported on Chrome Safari Mozilla Opera ChromeDevelopper Edge Opera Gx
 
const app = {

  init:function() {

    console.log('init');
    app.camStreamer();
    app.listAllPictures();
    app.currentBrowserCheck();
    app.browserSuportedConstraints();
   
    if (app.getcookie() === 'user=PhotoBooth'){
    app.userEnterWithCookie()
    document.querySelector('#errorMsg').removeAttribute('hidden');
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
    const videoConstraints = {

    width: { min: 320, ideal: 230, max: 640 },
    height: { min: 240, ideal: 240, max: 480},
    aspectRatio: { ideal: 1.7777777778 }

    };
      
    // si pas de valeur passée dans le select on prend par défaut la cam frontale.
    if (select.value === ''){
    videoConstraints.facingMode = 'user'; 
    } else {
      videoConstraints.deviceId = { exact: select.value };
    };
// todo ici filter les navigateurs regarder si cela a une action réelle ou pas ! 
//   navigator.getUserMedia = ( navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia || navigator.mediaDevices.getUserMedia);

    //* état final des constraints
    const constraints = {video: videoConstraints, audio: false};
    
    //* getUserMedia: demande d'autorisation d'accès à la caméra. 
    navigator.mediaDevices.getUserMedia(constraints).then(stream => {
    
    userHasGrantedPermission = true;

    if (userHasGrantedPermission === true && stream.active === true) {

    app.displayCurrentCamName();
    // tout est validé j'ai la permission + un stream actif -> je crée la liste de mes options select
    app.createListDevice(); 

// todo ici filter les navigateurs
    if (navigator.userAgent.indexOf("Chrome") !== -1){
      document.querySelector('video').autoplay = true;
      document.querySelector('video').controls = true;
      //document.querySelector('video').playsinline = true; 

    } else {
      console.log('je suis dans le else donc pas dans Chrome')
      document.querySelector('video').autoplay = false;
      document.querySelector('video').controls = true;      
      document.querySelector('video').controls = true;  
      //document.querySelector('video').playsinline = true;  
    }
    
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
    //app.monitorCurrentStremValues(getStreamValues);

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
      
      } 
      if (err.name === 'NotReadableError' || err.message === 'Permission denied undefined'){
        let errorName =  'L\'autorisation d\'accès à votre caméra rencontre un problème :'
        let errorMessage = 'le type de l\'erreur n\'a pas été précisée !'
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
    app.resetListDevices();
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
    const apiRootUrl = 'https://photoboothback.simschab.fr/api';
    //const apiRootUrl = 'http://127.0.0.1:8000/api';

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
      const apiRootUrl = 'https://photoboothback.simschab.fr/getpictures'
      //const apiRootUrl = 'http://127.0.0.1:8000/getpictures'

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
   * Detect if Smartphone or facebook internal browser
   * and return a user info message for each case
   * prevent for compatibility
  */
  currentBrowserCheck :function() {
    console.log('windowMobileCheck')
    //*Fecebook Browser Detection
    // let check = false;

    // (function(a){
    // if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))
    // check = true;})

    // (navigator.userAgent||navigator.vendor||window.opera);

    // if(check === true){
      
    //   document.getElementById('smartAlert').innerHTML += `

    //   <div class="alert alert-primary" role="alert" id="smartAlert">
    //   <b>
    //   <span>&#129310;</span>
    //   SmartPhone Info</b>
    //   <span>&#129310;</span>
    //   <br>
    //   <hr>
    //   Compatible Android / Chrome / Safari / Mozilla
    //   <br>
    //   <hr>
    //   Compatibilité non garantie sur Iphone et iOS !<br><br>
    //   <button type="button" class="btn btn-primary" id="smartInfo">Fermer</button>
    //   </div>
    // `   
    // document.querySelector('#smartAlert').removeAttribute('hidden');
    // document.querySelector('#facebookAlert').setAttribute('hidden', false);

    //     document.getElementById('smartInfo').addEventListener('click', () => {
    //     document.querySelector('#smartAlert').setAttribute('hidden', true);
    //     });

    //   } 

      //*SmartPhone Detection
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