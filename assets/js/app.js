// https://developer.mozilla.org/en-US/docs/Web/API/MediaStream

const app = {
    init:function(){
        console.log('init');
        app.camStreamer(); 
        app.listAllPictures();
    },
    
    //lister tous les périfériques de capture dispo
    listDevice:function (){
        let select = document.getElementById('select');
        // je récupère les devices vidéo et audio diponnibles sur mon péréphérique
        navigator.mediaDevices.enumerateDevices().then(function(devices) {
            //je boucle sur chaque péréfériques audio et vidéo existants
            devices.forEach(function(device) {
                //si ce sont des device de type vidéo alors je les ajoutent dans les options de mon select
                if (device.kind === 'videoinput') 
                {
                    const option = document.createElement('option');
                    option.nodeType = 'submit';
                    //je passe aux value de mon select le nom des péréfériques dispo
                    option.value = device.deviceId;
                    const label = device.label || `Camera ${count++}`;
                    const textNode = document.createTextNode(label);
                    option.appendChild(textNode);
                    select.appendChild(option);
                }
                    //la liste de mes péréphériques
                    //console.log(device.kind + ": " + device.label + " id = " + device.deviceId);   
            });
        })

        .catch(function(err) {
            app.dislayError(' Erreur dans la listDevice ' + err.name + ": " + err.message);
        });  
    },
    
    // Stream vidéo
    camStreamer:function(){
    
        //je récupère la liste de mes devices pour initialiser les options de mon select.
        app.listDevice();   
    
        //* variables 'globales'
        let video = document.querySelector('video')
        let constrainsList = document.getElementById('constraintList')
        let stop = document.getElementById('stop');
        let catchButton = document.getElementById('catch');
        let clearButton = document.getElementById('reset');
        let canvas = document.querySelector("#canvas");
        let selectDisplay = document.getElementById('select');
        let errorMessage = document.getElementById('errorMsg');
        let rightCol = document.getElementById('right');

        video.classList.add('hidden');
        constrainsList.classList.add('hidden');
        stop.classList.add('hidden');
        catchButton.classList.add('hidden');
        clearButton.classList.add('hidden');
        canvas.classList.add('hidden');
        errorMessage.classList.add('hidden');
        rightCol.classList.add('hidden');


        let start = document.getElementById('start');
        //* lancement du stream au click sur le bouton Stat Cam
        start.addEventListener('click', () => {
        
        selectDisplay.classList.add('hidden');
        start.classList.add('hidden');

        // j'initialise un objet vide pour le moment qui prendra les valeurs de if/else
        const videoConstraints = {};

        if (select.value === '') {
          videoConstraints.facingMode = 'environment'; 
        } else {
          //*je passe comme contrainte le choix de la caméra dans récupérée dans la value du select  
          videoConstraints.deviceId = { exact: select.value };
          console.log(select.value)
        };

         //* Contraintes pour la vidéo dynamisée par les valeurs des if/else ci-dessus.
        // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
        const constraints = {
          video: videoConstraints,
          audio: false
        };
       
            // les constaints passées ici comme argument vont créer une demande d'autorisation d'accès à la caméra. 
            navigator.mediaDevices.getUserMedia(constraints).then(stream => {

                //* On insére le stream dans la balise <video></vidéo> 
                video.srcObject = stream;
                
                //*gestion de l'affichage des boutons
                video.classList.remove('hidden')
                catchButton.classList.remove('hidden');
                clearButton.classList.remove('hidden');
                stop.classList.remove('hidden');

                //* si le stream est en bien en cours de lecture
                video.addEventListener("playing", () => {
                document.getElementById('errorMsg').classList.add('hidden');
                document.getElementById('right').classList.remove('hidden');
                document.getElementById('left').style.height ='auto';
                video.style.width ='320px';
                video.style.heigth ='240px';
                constrainsList.classList.remove('hidden');
                app.browserSuportedConstraints();   
                });
                
                //*Appel functions take et reset capture canvas
                app.takeCapture();
                app.resetCaptureCanvas(); 
                //*

                //*Appel boutton stop stream et full resetndu stream en cours
                stop.addEventListener('click', () => { 
                app.resetMediaStream(stream, video);
                selectDisplay.classList.remove('hidden');
                selectDisplay.classList.add('visible');
                start.classList.add('visible');
                start.classList.remove('hidden');
                video.classList.add('hidden');
                constrainsList.classList.add('hidden');
                stop.classList.add('hidden');
                catchButton.classList.add('hidden');
                clearButton.classList.add('hidden');
                canvas.classList.add('hidden');
                });

            })
                .catch(function(err) {
                    app.dislayError(' Erreur dans camStreamer ' + err.name + ": " + err.message);
                });
        });

    },
    
    // liste les contraintes supportées par le navigateur
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
    
    // initialisation du template d'affichage des messages d'erreur.
    dislayError: function(error) {
        //si on rentre ici c'est qu'il y a une erreur
        document.getElementById('constraintList').classList.add('hidden')
        document.getElementById('select').classList.remove('hidden')
        document.getElementById('start').classList.remove('hidden')
        //je place une balise dans le code html pour afficher les messsages d'erreurs.
        let errorElement = document.getElementById('errorMsg');
        errorElement.classList.remove('hidden');
        errorElement.innerHTML += '<p>' + error + '</p>';
    },
    
    // faire une capture & API POST
    takeCapture:function () {
        let video = document.querySelector('video');
            // facultatif - on contrôle que la vidéo est bien en cours de lecture
            video.addEventListener("playing", () => {
            let catchPicture = document.getElementById('catch');
            let canvas = document.querySelector("#canvas");
            canvas.width = video.offsetWidth;
            canvas.height = video.offsetHeight;
            
            catchPicture.addEventListener('click', () => {
            canvas.classList.remove('hidden');
            canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
            
            // https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch
            //todo je prépare les datas Json à envoyer dans ma requête POST
            //* capture l'url canvas à transfèrer en api avec les paramètres jpg et qaulité
            let dataURL = canvas.toDataURL('image/jpeg', 1.0);
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
                app.listAllPictures();
            })
            .catch(function(errorMsg){
                console.log(errorMsg)
            });
            }); // end fetch //todo fin de ma requête POST
        });//end listener stream is playing
    },

    // API GET on liste toutes les images
    listAllPictures: function () {

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
            console.log(data)
            for (let i = 0; i < data.length; i ++){
                //output = document.getElementById('canvasImg').src = data[i].picture;
                output = document.getElementById('canvasImg')
                output.innerHTML += `
                <img id="canvasImg" src="${data[i].picture}" alt="canvas" width="160" height="120">  
              `
            }
        });
    },

    // supprimer la capture
    resetCaptureCanvas:function () {
        let resetCanvasButton = document.getElementById('reset');
        
        resetCanvasButton.addEventListener('click', () => {
        let canvas = document.getElementById('canvas');
        canvas.classList.add('hidden');
        let context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        });
    },

    // reset display stream
    resetMediaStream: function(stream, video){
        document.getElementById('constraintList').classList.add('hidden')
        video.classList.add('hidden');
        canvas.classList.add('hidden');

        stream.getTracks().forEach(function(track){
        track.stop();
        });
    },
    
    // reset all pictures div on Api Get request 
    resetpictureDiv:function(){
        document.getElementById('canvasImg').innerHTML = '';
    }
};
    
document.addEventListener('DOMContentLoaded', app.init)