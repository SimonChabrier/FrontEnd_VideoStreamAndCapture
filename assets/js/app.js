// https://developer.mozilla.org/en-US/docs/Web/API/MediaStream

const app = {
    init:function(){
        console.log('init');
        app.camStreamer(); 
    },
    
    //lister tous le spérifériues de capture
    listDevice:function (){
        let select = document.getElementById('select');
        // je récupère les devices vidéo et audio diponnibles sur mon péréphérique
        navigator.mediaDevices.enumerateDevices().then(function(devices) {
            //je boucle sur chaque péréfériques audio et vidéo existants
            devices.forEach(function(device) {
                //si ce sont des device de type vidéo alor je les ajoutent dans les options de mon select
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
                    console.log(device.kind + ": " + device.label + " id = " + device.deviceId);   
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

        video.classList.add('hidden');
        constrainsList.classList.add('hidden');
        stop.classList.add('hidden');
        catchButton.classList.add('hidden');
        clearButton.classList.add('hidden');
        canvas.classList.add('hidden');

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
                document.getElementById('errorMsg').classList.add('hidden')
                video.style.width ='320px';
                video.style.heigth ='240px';
                constrainsList.classList.remove('hidden');
                app.browserSuportedConstraints();   
                });
                
                //*Appel functions take et reset capture canvas
                app.takeCapture();
                app.resetCaptureCanvas(); 

                //*Appel boutton stop stream et full resetndu stream en cours
                stop.addEventListener('click', () => { 
                app.resetMediaStream(stream, video)
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
        let constraintInfo = document.createTextNode('Liste des contraintes supportées');
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
    
    // faire une capture
    takeCapture:function () {
    
        let video = document.querySelector('video');
            // facultatif - on contrôle que la vidéo est bien en cours de lecture
            video.addEventListener("playing", () => {
            let catchPicture = document.getElementById('catch');
            let canvas = document.querySelector("#canvas");
            canvas.width = video.offsetWidth;
            canvas.height = video.offsetHeight;
            
            catchPicture.addEventListener('click', function() {
            canvas.classList.remove('hidden');
            canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
            });
        });
    },
    
    // supprimer la capture
    resetCaptureCanvas:function () {
        let resetCanvasButton = document.getElementById('reset');
        
        resetCanvasButton.addEventListener('click', function() {
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
    
};
    
document.addEventListener('DOMContentLoaded', app.init)