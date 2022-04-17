// https://developer.mozilla.org/en-US/docs/Web/API/MediaStream
//! error notAllowedError veut dire que l'accès à la caméra n'a pas été autorisé par l'utilisateur ou n'a pas été demandé par le navigateur
const app = {
    init:function() {
        console.log('init');
        app.createListDevice();
        app.listAllPictures();
        app.isFacebookApp();
        //app.browserSuportedConstraints();
        if (app.getcookie() === 'user=PhotoBooth'){ app.userEnterWithCookie();}
        if(app.isFacebookApp()){app.onFacebooKload();}
},
    
    //lister tous les périfériques de capture dispo
    createListDevice:function () {
        //todo celui là il faut la laisser là.
        app.camStreamer();
        // je récupère les devices vidéo et audio dipo sur mon péréphérique
        navigator.mediaDevices.enumerateDevices().then(function(devices) {
            let count = 1;

            //je boucle sur chaque péréfériques audio et vidéo existants
            devices.forEach(function(device) {
                
                //si ce sont des device de type vidéo alors je les ajoutent dans les options de mon select
                if (device.kind === 'videoinput') 
                {   
                    
                    let select = document.getElementById('select'); // j'ai mon élément sélect qui existe déjà en dur
                    let option = document.createElement('option'); // je crée un élément option

                    //option.nodeType = 'submit'; // je lui dit qu'il est de type submit pas besoin pace que je sumbit au clik sur le bouton
                    option.value = device.deviceId;

                    let label = device.label; // la j'ai le nom de chaque cam à chaque tour de boucle
                    
                    if (device.label === ''){
                        //alert('pas de label!')
                        label = device.kind
                    }

                    let camName = document.createTextNode(label + ' N° '+ `${count++}`); //! le navigateur Facebook ne sait pas retourner le nom de la caméra !
                    
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
    console.log('camStreamer:function')
        //je récupère la liste de mes devices pour initialiser les options de mon select.  
        
        //* elements necessaires ici en fonction des événements qui vont se passer.
        let video = document.querySelector('video')
        let stop = document.getElementById('stop');
        let catchButton = document.getElementById('catch');
        let postButton = document.getElementById('post');
        let clearButton = document.getElementById('reset');
        let canvas = document.querySelector("#canvas");
        let selectDisplay = document.getElementById('select');
        let errorMessage = document.getElementById('errorMsg');
        let start = document.getElementById('start');
        
        //*état d'affichage au départ.
        video.classList.add('hidden');
        stop.classList.add('hidden');
        catchButton.classList.add('hidden');
        postButton.classList.add('hidden');
        clearButton.classList.add('hidden');
        canvas.classList.add('hidden');
        errorMessage.classList.add('hidden');

        //* lancement du stream au click sur le bouton Stat Cam
        start.addEventListener('click', () => {
         
        selectDisplay.classList.add('hidden');
        start.classList.add('hidden');

        // j'initialise un objet vide pour le moment qui prendra les valeurs de if/else
        const videoConstraints = {};
        // si rien n'est lectionné on retourne la cam par défaut
        if (select.value === '') {
            // force rear cam
          videoConstraints.facingMode = 'environment'; 
           // force front cam
          videoConstraints.facingMode = 'user'; 
        } else {
          //sinon on retourne la caméra choisie dans la select list.  
          videoConstraints.deviceId = { exact: select.value };
        };
        //* Contraintes pour la vidéo dynamisée par les valeurs des if/else ci-dessus.
        // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
        const constraints = {
          video: videoConstraints,
          audio: false
        };

        let prompted = null
        if (prompted == null) {
            prompted = false
        }

        if(prompted === false)

         
            // les constaints passées ici comme argument vont créer une demande d'autorisation d'accès à la caméra. 
            navigator.mediaDevices.getUserMedia(constraints).then(stream => {
            
            //todo On insére le stream dans la balise <video></vidéo> 
            video.srcObject = stream;
            
            //* ça streame on affiche ou masque les boutons que l'on souhaite
            video.classList.remove('hidden')
            catchButton.classList.remove('hidden');
            clearButton.classList.remove('hidden');
            stop.classList.remove('hidden');

            //* si le stream est en bien en cours de lecture
            video.addEventListener("playing", () => {
            document.getElementById('errorMsg').classList.add('hidden');
            document.getElementById('left').style.height ='auto';
		  	video.style.width ='320px';
            video.style.heigth ='240px';
            });

            // prend la capture
            app.takeCapture();
        
            //*Appel boutton stop stream et full reset du stream en cours
            stop.addEventListener('click', () => { 

            //* je reset les médias en cours de lecture pour switcher de cam.
            // parce que problème si deux cam avant et deux cam arrière
            // on ne peut pas passer de l'une à l'autre (Cam avant 1 -> Cam avant 2) ou (Cam arrière 1 -> Cam arrière 2) à la volée
            // on n'aurai pas le problème pour passer d'une cam avant à une cam arrière à la volée.
            app.resetMediaStream(stream, video, postButton);

            selectDisplay.classList.remove('hidden');
            stop.classList.add('hidden');
            catchButton.classList.add('hidden');
            start.classList.add('visible');
            start.classList.remove('hidden');
            selectDisplay.classList.add('visible');
            start.classList.add('visible');
            video.classList.add('hidden');
            clearButton.classList.add('hidden');
            canvas.classList.add('hidden');
            });

        })//en stream
            .catch(function(err) {
                app.dislayError(' Erreur dans camStreamer ' + err.name + ": " + err.message);
            });//end errors

        prompted = true

        });//*fin du start au listener sur le clic de  start

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
         
        if (app.getcookie() === 'user=PhotoBooth'){
            // app.resetErrorPostMessage();
            // app.resetCaptureCanvas(); 
            // postErrorMessage.classList.remove('hidden');
            // postErrorMessage.innerHTML += 'Vous avez déjà posté une photo ! ... revenez demain...pour en poster une autre'
            // postButton.classList.add('hidden');
            // deleteButton.classList.add('hidden');
            // catchPicture.classList.add('hidden');
            // canvas.classList.add('hidden');
            // postButton.classList.add('hidden');
            // deleteButton.classList.add('hidden');

        } else { 
            postButton.classList.add('hidden');
            deleteButton.classList.add('hidden');
            catchPicture.classList.remove('hidden');
            canvas.classList.add('hidden');
            let dataURL = canvas.toDataURL('image/jpeg', 1.0);
            //*j'apelle ma fonction api POST au clic sur Post My picture et le lui passe mon canvas.
            app.postNewPictre(dataURL);
            } 
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

    // reset display stream
    resetMediaStream: function(stream, video, post){
    console.log('resetMediaStream: function(stream, video)')
        
        video.classList.add('hidden');
        canvas.classList.add('hidden');
        post.classList.add('hidden');
        //stop all tracks
        stream.getTracks().forEach(function(track){
        track.stop();
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
        document.getElementById('constraintList').classList.add('hidden')
        document.getElementById('select').classList.remove('hidden')
        document.getElementById('start').classList.remove('hidden')
        //je place une balise dans le code html pour afficher les messsages d'erreurs.
        let errorElement = document.getElementById('errorMsg');
        errorElement.classList.remove('hidden');
        errorElement.innerHTML += '<p>' + error + '</p>';
        alert(error);
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

