// https://developer.mozilla.org/en-US/docs/Web/API/MediaStream
//* Contraintes pour la vidéo dynamisée par les valeurs des if/else ci-dessus.
// https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia

//todo problème N°2 le canvas ne se vide pas quand on change de caméra chaque ACTION de capture est mémorisée comme si il avait un compteur ! il postera la dernière image mais autant de fois qu'on aura changé de caméra
//todo masquer le vidéoBlock si erreur.

const app = {

  init:function() {

    console.log('init');
    app.camStreamer();
    app.listAllPictures();;
    if (app.getcookie() === 'user=PhotoBooth'){
    app.userEnterWithCookie()
    document.querySelector('#errorMsg').removeAttribute('hidden');
    }
    if (app.isFacebookApp()){
    app.onFacebooKload()
    }
  },
  
  // Stream vidéo
  camStreamer:function() {

    app.resetCurrentCamName()

    let startStateElements = document.querySelectorAll('#catch, #reset, #post, #canvas, #videoElement, #stop, #errorMsg');
    let isCurentlyStreaming = document.querySelectorAll('#start, #post, #errorMsg, #canvas, #select');
    let userHasGrantedPermission = false;
      
    //* état d'affichage au départ.
    startStateElements.forEach(function(elements) {
    elements.setAttribute('hidden', true);
    });

    document.getElementById('start').addEventListener('click', () => {
    app.resetCanvasContext(); 
    //* pré - initialisation des constraints.

    const videoConstraints = {};
      
    // si pas de valeur passée dans le select
    if (select.value === ''){
    videoConstraints.facingMode = 'user'; 
    } else {
      videoConstraints.deviceId = { exact: select.value };
    };

    //* état final des constraints
    const constraints = {video: videoConstraints, audio: false};
    app.resetCanvasContext();

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

    //* On autorise la prise d'une capture
    app.takeCapture();
    
    //* ici on monitore en console toutes les valeurs de notre objet MediaStream en lecture
    const getStreamValues = stream.getTracks();
    app.monitorCurrentStremValues(getStreamValues);
    
    //* actions quand on arrête le stream en cours
    document.querySelector('#stop').addEventListener('click', () => { 
    document.querySelector('#start').removeAttribute('hidden');
    document.querySelector('#select').removeAttribute('hidden');

    app.resetCurrentCamName();
    app.resetCanvasContext();

    app.stopCurrentStreamAndClearTracks(getStreamValues);
    app.monitorCurrentStremValues(getStreamValues);

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

  // Contruire la liste des périfériques vidéo dans le select
  createListDevice:function () {
    //*je resete la liste avant de la contruire
    app.resetMediaListOption();
      // je récupère les devices vidéo et audio dipo sur mon péréphérique
      navigator.mediaDevices.enumerateDevices()
      .then(function(devices) {
          let count = 1;

          devices.forEach(function(device) {  

              if (device.kind === 'videoInput') {   

              let select = document.getElementById('select'); // j'ai mon élément sélect qui existe déjà en dur
              let option = document.createElement('option'); // je crée un élément option

              option.value = device.deviceId;

              let label = device.label; // nom de la cam
              if (device.label === ''){
                label = device.kind
              }

              let camName = document.createTextNode(label + ' N° '+ `${count++}`);
              select.appendChild(option); // j'attache mes options à mon element select
              option.appendChild(camName);  

              }
                  //la liste de mes péréphériques
                  console.log(device.kind + ": " + device.label + " id = " + device.deviceId);   
          });
      })

      .catch(function(err) {
          //alert('impossible d\'initialiser les péréfériques')
          alert(' Erreur dans la listDevice ' + err.name + ": " + err.message);
      });  
  },
  
  // Afficher le nom de la caméra qui streame
  displayCurrentCamName:function(){
    let sel = document.getElementById('select');
    let value = sel.options[sel.selectedIndex].text;
    document.getElementById('currentCamName').removeAttribute('hidden');
    document.getElementById('currentCamName').innerHTML = 'Streaming On : ' + value;
  },
 
  // Arrêter le sream en cours
  stopCurrentStreamAndClearTracks:function(getStreamValues){
  //* loop on MediaStream and use native MediaStream Object stop() function
    getStreamValues.forEach(function(track) {
      track.stop();
    });
  },

  // Reinitialiser le nom de la caméra
  resetCurrentCamName:function(){
    document.getElementById('currentCamName').setAttribute('hidden', true)
    document.getElementById('currentCamName').innerHTML = '';
  },

  // Reinitialiser la liste des cams dans les options pour la reconstruire à chaque passage dans camStreamer
  resetMediaListOption:function(){
    let options = document.querySelectorAll('#select option');
        options.forEach(element => element.remove());
  },

  // Récupérer les valeurs du stream pour monitorer en console.
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

  // Faire une capture dans un canvas
  takeCapture:function () {
  console.log('takeCapture:function')
    app.resetCanvasContext();
    document.querySelector('#reset').setAttribute('hidden', true)

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
    document.querySelector('#stop').addEventListener('click', () => {
    app.resetCanvasContext();  
    });

    });

    //reset canvas si clic sur delete picture.
    document.querySelector('#reset').addEventListener('click', () => {
    app.resetCanvasContext();
    }); 
    
    document.querySelector('#post').addEventListener("click", () => {
    let dataURL = canvas.toDataURL('image/jpeg', 1.0);
    //*j'apelle ma fonction api POST au clic sur Post My picture et le lui passe mon canvas.
    app.postNewPicture(dataURL);
    }, false); 
  },

  // API POST
  postNewPicture:function(dataURL) {
  console.log('postNewPicture:function')

          //* je crée une date
          let createdAt = new Date();

          //* Je préprare le contenu des valeurs à donner à mes propriétés
          //!  ils doivent correspondre aux propriétés non nullables de mon entité.
          const data = { 
              picture: dataURL,
              createdAt: createdAt
          };

          //* préparation des Headers
          const httpHeaders = new Headers();
          httpHeaders.append('Content-Type', 'application/json');
          
          //* route de mon back-end Symfony
          const apiRootUrl = 'https://photoboothback.simschab.fr/api';
      
          //* Je poste sur la route API 
          const fetchOptions = 
          {
          method: 'POST', // ou 'PUT' etc
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
              app.resetPictureListDiv();
              app.setCookie();
              app.resetMainVideoDiv();
              app.resetCanvasContext();
              document.querySelector('#errorMsg').removeAttribute('hidden');
              setTimeout(function() {
                location.reload();
              }, 1600);
          })
          .catch(function(errorMsg){
              console.log(errorMsg)
          });
  },

  // API GET 
  listAllPictures: function () {
  console.log('listAllPictures: function')
      const apiRootUrl = 'https://photoboothback.simschab.fr/getpictures'

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
              //console.log(data[value].picture);

              output = document.getElementById('canvasImg')
              output.innerHTML += `
              <img id="canvasImg" src="${data[value].picture}" alt="canvas" width="160" height="120">  
            `
            }
      });
  },
  
  // ResetCanvasContext
  resetCanvasContext:function(){
  console.log('resetCanvasContext:function')

  let ElementsToHide = document.querySelectorAll('#canvas, #post, #reset');
    
  ElementsToHide.forEach(function(elements) {
  elements.setAttribute('hidden', true)  
  });

  document.querySelector('#catch').removeAttribute('hidden')
  let canvas = document.querySelector('canvas'); 
  let context = canvas.getContext('2d');
  console.log(context)
  context.clearRect(0, 0, canvas.width, canvas.height)
  console.log(context)
  },

  // Reset de la div main vidéo après post
  resetMainVideoDiv:function(){
      let MainVideoDiv = document.getElementById('videoBlock');
      let postErrorMessage = document.getElementById('errorMsg');
      MainVideoDiv.classList.add('hidden');
      postErrorMessage.classList.remove('hidden');
      postErrorMessage.style.background = "#298838";
      postErrorMessage.innerHTML += ' -----> Image ajoutée <----- '
  },

  // Reset all pictures in div on Api GET request pur éviter de remplir à nouveau la div
  resetPictureListDiv:function(){
  console.log('resetPictureListDiv:function')
      document.getElementById('canvasImg').innerHTML = '';
  },

  resetErrorPostMessage:function(){
  document.getElementById('errorMsg').innerHTML = '';
  },

  // Liste les contraintes supportées par le navigateur (actuellment non exploité dans l'affichage)
  // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getSupportedConstraints
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

  // Initialisation du template d'affichage des messages d'erreur.
  dislayError: function(errorName, errorMessage) {
  console.log('dislayError: function') 
      // Pour le moment il n'y en a qu'un mais on est prêt à en entre d'autres si besoin.
      let errorElements = document.querySelectorAll('#errorMsg')
      errorElements.forEach(function(elements) {
      elements.removeAttribute('hidden');
      });
      document.getElementById('errorMsg').innerHTML += '<p>' + errorName + '<br>' + errorMessage + '</p>';
  },

  // Je crée un cookie pour l'app avec une date d'expiration de 1 jour.
  setCookie:function () {
  let date = new Date(Date.now() + 86400000); //86400000ms = 1 jour
  date = date.toUTCString();
  let path = window.location.origin;
  //Crée ou met à jour un cookie 'user'
  document.cookie = 'user=PhotoBooth; path=' + path + '; expires=' + date; 
  },

  // Je vérifie si j'ai le cookie ou pas dans la navigateur de l'utilisateur
  getcookie:function() {  
      let decodedCookie = decodeURIComponent(document.cookie);
      return decodedCookie
  },

  // Ce que je fais si l'utilisateur a un cookie présent
  userEnterWithCookie :function() {
      let postErrorMessage = document.getElementById('errorMsg');
      let homeSelect = document.getElementById('divSelect');
      let homeStart = document.getElementById('start');
      homeSelect.classList.add('hidden');
      homeStart.classList.add('hidden');
      postErrorMessage.classList.remove('hidden');
      postErrorMessage.innerHTML += 'Vous avez déjà posté une photo ! <br> revenez demain pour en poster une autre'
  },

  // Détecter la navigateur de facebook
  isFacebookApp : function() {
    console.log('isFacebookApp')
      var ua = navigator.userAgent || navigator.vendor || window.opera;
      return (ua.indexOf("FBAN") > -1) || (ua.indexOf("FBAV") > -1);
  },

  // Ce que l'on fait si c'est facebook ! 
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