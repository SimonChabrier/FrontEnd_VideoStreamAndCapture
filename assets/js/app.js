// https://developer.mozilla.org/en-US/docs/Web/API/MediaStream
//* Contraintes pour la vidéo dynamisée par les valeurs des if/else ci-dessus.
// https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
//todo promblème N°1 les devices n'ont pas de name avant que l'on actualise la page au moins une fois..
//todo problème N°2 le canvas ne se vide pas quand on change de caméra chaque ACTION de capture est mémorisée comme si il avait un compteur ! il postera la dernière image mais autant de fois qu'on aura changé de caméra
//todo problème N°3 l'autorisation d'utiliser la caméra est demandé à chaque changement de caméra sur facebook

const app = {
    init:function() {
        console.log('init');
        
        app.camStreamer();
        //app.listAllPictures();
        app.isFacebookApp();
        //app.dislayError();
        //app.browserSuportedConstraints();
        if (app.getcookie() === 'user=PhotoBooth'){ app.userEnterWithCookie();}
        if(app.isFacebookApp()){app.onFacebooKload();}
},
    
    //lister tous les périfériques de capture dispo
    createListDevice:function () {
        // je récupère les devices vidéo et audio dipo sur mon péréphérique
        navigator.mediaDevices.enumerateDevices()
        .then(function(devices) {
            let count = 1;

            devices.forEach(function(device) {  

                if (device.kind === 'videoinput') {   

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
    
    // Stream vidéo
    camStreamer:function() {
    
          let startStateElements = document.querySelectorAll('#catch, #reset, #post, #canvas, #videoElement, #stop, #errorMsg');
          let isCurentlyStreaming = document.querySelectorAll('#start, #post, #errorMsg, #canvas');
          let isGrantedCam = false;
          
          //* état d'affichage au départ.
          startStateElements.forEach(function(elements) {
          elements.setAttribute('hidden', true);
          });
          
          //* pré - initialisation des constraints.
          const videoConstraints = {};

          // si pas de valeur passée dans le select
          if (select.value === ''){
          videoConstraints.facingMode = 'user'; 
          } else {
            videoConstraints.deviceId = { exact: select.value };
          };

          //* état final des constraints
          const constraints = { video: videoConstraints, audio: false};

          //* lancement du stream au click sur le bouton Stat Cam
          document.getElementById('start').addEventListener('click', () => {

          //* getUserMedia: demande d'autorisation d'accès à la caméra. 
          navigator.mediaDevices.getUserMedia(constraints).then(stream => {
          
          isGrantedCam = true;

          if (isGrantedCam === true && stream.active === true) {
          
          //* on a eu l'autorisation ET on a un stream on insère
          document.querySelector('video').srcObject = stream
          //* On autorise la prise d'une capture
          app.takeCapture();
         
          //* on affiche ou masque les boutons que l'on souhaite
          startStateElements.forEach(function(elements) {
          elements.removeAttribute('hidden');
          });

          isCurentlyStreaming.forEach(function(elements){
          elements.setAttribute('hidden', true)
          });

          //* ici on monitore en console toutes les valeurs de notre objet MediaStream
          const getStreamValues = stream.getTracks();

          getStreamValues.forEach(function(track) {
            //* on initialise nos variables avec les valeurs de retour de nos méthodes propres à MediaStream
            let trackSettings = track.getSettings();
            let trackCapbilities = track.getCapabilities();
            let trackConstraints = track.getConstraints();

                //* On boucle sur les paires clé/valeur de chacun de nos objets    
                for (const [key, value] of Object.entries(trackSettings)) {
                  console.log('TRACK SETTINGS ' + key + ' : ' + value);
                };
                
                for (const [key, value] of Object.entries(trackCapbilities)) {
                  console.log('TRACK CAPABILITIES ' +key + ' : ' + value);
                };
                
                for (const [key, value] of Object.entries(trackConstraints)) {
                  console.log('TRACK CONSTRAINTS ' + key + ' : ' + value);
                };
          });
          
          //* stop all tacks
          document.querySelector('#stop').addEventListener('click', () => { 
          document.querySelector('#start').removeAttribute('hidden');
          //* loop on MediaStream and use native MediaStream Object stop() function
          const streamValues = stream.getTracks();
          streamValues.forEach(function(track) {
            track.stop();
          });

          
          //* on réinitialise l'état de l'affichage du départ.
          startStateElements.forEach(function(elements) {
          elements.setAttribute('hidden', true);
            });//end foreach

          });

        };//end if is grantedCam and streamActive

        })//end stream GetUSerMedia

        .catch(function(err) {
            app.dislayError(' Erreur dans camStreamer ' + err.name + ": " + err.message + ' L\'autorisation d\'accès à votre caméra n\'a pas été validé !');
        });

      });//end click start listener

    },
    
    // Faire une capture dans un canvas
    takeCapture:function () {
    console.log('takeCapture:function')
        let video = document.querySelector('video');
        let postButton = document.getElementById('post');
        let deleteButton = document.getElementById('reset');
        let catchPicture = document.getElementById('catch');
        deleteButton.classList.add('hidden');
        catchPicture.classList.remove('hidden');
        
        // facultatif - on contrôle que la vidéo est bien en cours de lecture
        video.addEventListener("playing", () => {
        catchPicture.classList.remove('hidden');
        let canvas = document.querySelector("#canvas");
        canvas.width = video.offsetWidth;
        canvas.height = video.offsetHeight;
        // si j'ai bien un stream alors, au click je fait mon canvas à partir de l'image interceptée sur le stream en cours
            catchPicture.addEventListener('click', () => {
            // reset la canvas contenant la campture
            app.resetCaptureCanvas();  
            catchPicture.classList.add('hidden');
            deleteButton.classList.remove('hidden');
            postButton.classList.remove('hidden');
            canvas.classList.remove('hidden');
            canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
            }); 
        });

        deleteButton.addEventListener('click', () => {
        deleteButton.classList.add('hidden');
        post.classList.add('hidden');
        catchPicture.classList.remove('hidden');
        }); 
        
        postButton.addEventListener("click", () => {
         
            postButton.classList.add('hidden');
            deleteButton.classList.add('hidden');
            catchPicture.classList.remove('hidden');
            canvas.classList.add('hidden');
            let dataURL = canvas.toDataURL('image/jpeg', 1.0);
            //*j'apelle ma fonction api POST au clic sur Post My picture et le lui passe mon canvas.
            app.postNewPictre(dataURL);
 
        }, false); 
    },

    // API POST
    postNewPictre:function(dataURL) {
    console.log('postNewPictre:function')

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
                app.listAllPictures();
                app.setCookie();
                app.resetMainVideoDiv();
            })
            .catch(function(errorMsg){
                console.log(errorMsg)
            });
    },

    //reset de la div main vidéo après post
    resetMainVideoDiv:function(){
        let MainVideoDiv = document.getElementById('videoBlock');
        let postErrorMessage = document.getElementById('errorMsg');
        MainVideoDiv.classList.add('hidden');
        postErrorMessage.classList.remove('hidden');
        postErrorMessage.style.background = "#298838";
        postErrorMessage.innerHTML += ' -----> Image ajoutée <----- '
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

    //supprimer la capture
    resetCaptureCanvas:function () {
    console.log('resetCaptureCanvas:function')
        let resetCanvasButton = document.getElementById('reset');
        resetCanvasButton.addEventListener('click', () => {
        canvas.classList.add('hidden');
        });
    },

    // reset all pictures in div on Api GET request pur éviter de remplir à nouveau la div
    resetpictureDiv:function(){
    console.log('resetpictureDiv:function')
        document.getElementById('canvasImg').innerHTML = '';
    },

    resetErrorPostMessage:function(){
    document.getElementById('errorMsg').innerHTML = '';
    },

    // liste les contraintes supportées par le navigateur
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getSupportedConstraints
    browserSuportedConstraints:function () {
    console.log('browserSuportedConstraints:function')   
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

    // initialisation du template d'affichage des messages d'erreur.
    dislayError: function(error) {
    console.log('dislayError: function') 
        //si on rentre ici c'est qu'il y a une erreur
        let errorlements = document.querySelectorAll('#errorMsg')
        errorlements.forEach(function(elements) {
        elements.removeAttribute('hidden');
        });
        let errorElement = document.getElementById('errorMsg');
        //errorElement.classList.remove('hidden');
        errorElement.innerHTML += '<p>' + error + '</p>';
    },

    // je crée un cookie pour l'app avec une date d'expiration de 1 jour.
    setCookie:function () {
    let date = new Date(Date.now() + 86400000); //86400000ms = 1 jour
    date = date.toUTCString();
    let path = window.location.origin;
    //Crée ou met à jour un cookie 'user'
    document.cookie = 'user=PhotoBooth; path=' + path + '; expires=' + date; 
    },

    // je vérifie si j'ai le cookie ou pas dans la navigateur de l'utilisateur
    getcookie:function() {  
        let decodedCookie = decodeURIComponent(document.cookie);
        return decodedCookie
    },

    userEnterWithCookie :function() {
        let postErrorMessage = document.getElementById('errorMsg');
        let homeSelect = document.getElementById('divSelect');
        let homeStart = document.getElementById('start');
        homeSelect.classList.add('hidden');
        homeStart.classList.add('hidden');
        postErrorMessage.classList.remove('hidden');
        postErrorMessage.innerHTML += 'Vous avez déjà posté une photo ! <br> revenez demain pour en poster une autre'
    },

    // détecter la navigateur de facebook
    isFacebookApp : function() {
        var ua = navigator.userAgent || navigator.vendor || window.opera;
        return (ua.indexOf("FBAN") > -1) || (ua.indexOf("FBAV") > -1);
    },

    //ce que l'on fait si c'est facebook ! 
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

