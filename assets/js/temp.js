// https://developer.mozilla.org/en-US/docs/Web/API/MediaStream

const app = {
    init:function(){
        console.log('init');
        app.camStreamer();
    },
    
    // Stream vidéo
    camStreamer:function(){
        //* variables globales
        // je récupère ma balise vidéo qui servira pour l'insertion du stream et je la masque par défaut.
        let video = document.querySelector('video')
        video.classList.add('hidden');
        // je récupère ma liste des contraintes supportées et je la masque par défaut
        let constrainsList = document.getElementById('constraintList')
        constrainsList.classList.add('hidden');
        // je récupère mon bouton start - stop - canvas
        let start = document.getElementById('start');
        let stop = document.getElementById('stop');
        let canvas = document.querySelector("#canvas");
    
        // je déclare les contraintes pour la vidéo et l'audio
        // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
        let constraints = window.constraints = {
            //on met les contraintes vidéo que l'on souhaite eg:
            //width: 320,
            //height: 240,
            //gestion de l'audio et de la vidéo
            audio: false,
            video: true
        };
        
            //* lancement du stream au click
            start.addEventListener('click', function() {
            // je récupère les constaints
            navigator.mediaDevices.getUserMedia(constraints)
            //* on lance le stream
            .then(function(stream) {
    
                // le stream se lance - je vérifie qu'il est actif et j'initialise l'affichage.
                video.addEventListener("playing", () => {
                    video.style.width ='320px';
                    video.style.heigth ='240px';
                    video.classList.remove('hidden')
                    canvas.classList.remove('hidden');
                    constrainsList.classList.remove('hidden');
                    app.browserSuportedConstraints();
                });
    
                    //todo vérifier ou récupérer les valeur courantes de la cam.
                    //console.log(stream.getVideoTracks()[0].getSettings().deviceId)
                    //console.log(stream.getVideoTracks()[0].getSettings().frameRate)
                    console.log(stream.getVideoTracks()[0].getSettings().height)
                    console.log(stream.getVideoTracks()[0].getSettings().width)
    
            //* On insére le stream dans la balise <video></vidéo> 
            video.srcObject = stream;
            //console.log(video.srcObject);
                
                //Appel functions take et reset picture
                app.takeCapture();
                app.resetCapture();
                
                // videoTracks c'est ma caméra et ses propriétés. 
                // ce sont des infos ça n'empêche rien de fonctionner 
                // c'est juste pour checker la cam dans les console log ci-dessous.
                // var videoTracks = stream.getVideoTracks();
                // ici je contrôle les valeurs de mes constraits
                // console.log('Le stream a les contraintes suivantes:', constraints);
                // console.log(constraints.width);
                // console.log(constraints.height);
                // je contrôle quelle caméra je récupère
                // console.log('Il utilise ici la caméra : ' + videoTracks[0].label);
    
                stop.addEventListener('click', function() {
                document.getElementById('constraintList').classList.add('hidden')
                    stream.getTracks().forEach(function(track){
                    track.stop();
                    });
                // fin du stream je reset la dimention de la fenêtre vidéo
                video.classList.add('hidden');
                canvas.classList.add('hidden');
                console.log('Le stream a pris fin');
                });//end listener
            })// end .then
            
            // on attrape les erreurs si il y en a
            .catch(function(error) {
                //si on rentre ici c'est qu'il y a eu un clic donc je vérouille la colonne de liste des contraintes
                document.getElementById('constraintList').classList.add('hidden')
                //je place une balise dans le code html pour afficher les messsages d'erreurs.
                let errorElement = document.querySelector('#errorMsg');
                errorElement.innerHTML += '<p>' + error + '</p>';
    
            });//end catch
        }); // end start
    
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
            canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
            // let image_data_url = canvas.toDataURL('image/jpeg');
            // data url of the image
            // more info https://usefulangle.com/post/353/javascript-canvas-image-upload
            // console.log(image_data_url);
            });
        });
    },
    
    // supprimer la capture
    resetCapture:function () {
        let click_button = document.querySelector("#reset");
        
        click_button.addEventListener('click', function() {
        var canvas = document.getElementById("canvas");
        var context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        });
    },
    
    };
    
    document.addEventListener('DOMContentLoaded', app.init)