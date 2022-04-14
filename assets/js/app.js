// https://developer.mozilla.org/en-US/docs/Web/API/MediaStream

const app = {
    init:function(){
        console.log('init');
        app.camStreamer(); 
    },
    
    //lister tous le spérifériues de capture
    listDevice:function (){
        //je récupère ma balise select
        let select = document.getElementById('select');
        // je liste les devices vidéo et audio diponnibles sur mon péréphérique
        navigator.mediaDevices.enumerateDevices().then(function(devices) {
            //je boucle sur chaque device dispo
            devices.forEach(function(device) {
                //si ce sont des device de type vidéo alor je les ajoutent dans les options de mon select
                if (device.kind === 'videoinput') {
                    const option = document.createElement('option');
                    option.nodeType = 'submit';
                    //ici j'ai comme value de mes selects le nom des péréfériques dispo
                    option.value = device.deviceId;
                    const label = device.label || `Camera ${count++}`;
                    const textNode = document.createTextNode(label);
                    option.appendChild(textNode);
                    select.appendChild(option);
                }//endif
                // ici j'ai la liste de tout mes péréphériques
                    //console.log(device.kind + ": " + device.label + " id = " + device.deviceId);   
            });//end foreach
        })//end navigator.mediadevice
        .catch(function(err) {
            console.log('je suis dans cette erreur' + err.name + ": " + err.message);
        });  
    },
    
    // Stream vidéo
    camStreamer:function(){
    
        //je récupère la liste de mes devices.
        app.listDevice();   
    
        //* variables globales
        // je récupère ma balise vidéo qui servira pour l'insertion du stream et je la masque par défaut.
        let video = document.querySelector('video')
        video.classList.add('hidden');
        // je récupère ma liste des contraintes supportées et je la masque par défaut
        let constrainsList = document.getElementById('constraintList')
        constrainsList.classList.add('hidden');
        // je récupère mon bouton start et stop
        let start = document.getElementById('start');
        let stop = document.getElementById('stop');
        // je récupère mon objet canvas et je le masque par défaut
        let canvas = document.querySelector("#canvas");
        canvas.classList.add('hidden');


        //* Contraintes pour la vidéo et l'audio
        // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
        
        //* initialisation au click
        start.addEventListener('click', function() {
            
            const videoConstraints = {};
            let currentStream;

            if (typeof currentStream !== 'undefined') {
                stopMediaTracks(currentStream);
            }

            if (select.value === '') {
              videoConstraints.facingMode = 'environment';
            } else {
            //je passe comme contrainte le choix de la caméra dans récupérée dans la value du select  
              videoConstraints.deviceId = { exact: select.value };
            }

            const constraints = {
              video: videoConstraints,
              audio: false
            };
    
            // les constaints passées ici comme argument vont créer une demande d'autorisation d'accès à la caméra.
            //* on lance le stream su l'utilisateur valide.
            
            navigator.mediaDevices.getUserMedia(constraints).then(stream => {
                //* On insére le stream dans la balise <video></vidéo> 
                currentStream = stream;
                video.srcObject = stream;
                // on affiche la fenêtre vidéo.
                video.classList.remove('hidden')
                // si le stream est en cours - je vérifie si il est actif et j'initialise l'affichage.
                video.addEventListener("playing", () => {
                video.style.width ='320px';
                video.style.heigth ='240px';
                constrainsList.classList.remove('hidden');
                app.browserSuportedConstraints();   
                });//end-listener
                //*Appel functions take et reset capture (canvas)
                app.takeCapture();
                app.resetCapture(); 

                //*Appel boutton stop stream et full resetndu stream en cours
                stop.addEventListener('click', () => { app.resetStream(stream, video)});//end listener
            })// end .then stream
                .catch(function(error) {
                    app.dislayError(error);
                });// end catch errors
        }); // end click listener du bouton start
    },//end function
    

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
        //si on rentre ici c'est qu'il y a eu un clic donc je vérouille la colonne de liste des contraintes
        document.getElementById('constraintList').classList.add('hidden')
        //je place une balise dans le code html pour afficher les messsages d'erreurs.
        let errorElement = document.querySelector('#errorMsg');
        errorElement.innerHTML += '<p> je suis dans display error'  + error + '</p>';
    },
    
    // faire une capture
    takeCapture:function () {
    
        let video = document.querySelector('video');
            // facultatif - on contrôle que la vidéo est bien en cours de lecture
            video.addEventListener("playing", () => {
            let click_button = document.querySelector("#catch");
            let canvas = document.querySelector("#canvas");
            canvas.width = video.offsetWidth;
            canvas.height = video.offsetHeight;
            
            click_button.addEventListener('click', function() {
            canvas.classList.remove('hidden');
            canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
            });
        });
    },
    
    // supprimer la capture
    resetCapture:function () {
        let click_button = document.querySelector("#reset");
        
        click_button.addEventListener('click', function() {
        var canvas = document.getElementById("canvas");
        canvas.classList.add('hidden');
        var context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        });
    },

    resetStream: function(stream, video){
        document.getElementById('constraintList').classList.add('hidden')
        video.classList.add('hidden');
        canvas.classList.add('hidden');
        stream.getTracks().forEach(function(track){
        track.stop();
        });
    }
    
};
    
document.addEventListener('DOMContentLoaded', app.init)