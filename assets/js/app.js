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

    //* Contraintes pour la vidéo et l'audio
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
    let constraints = window.constraints = {
        //on met les contraintes vidéo que l'on souhaite eg:
        //width: 320,
        //height: 240,
        //gestion de l'audio et de la vidéo
        audio: false,
        video: true
    };
    
        //* initialisation au click sur le bouton 'start cam'
        start.addEventListener('click', function() {
        // les constaints passées ici comme argument vont créer une demande d'autorisation d'accès à la caméra.
        //* on lance le stream su l'utilisateur valide.
        navigator.mediaDevices.getUserMedia(constraints).then(function success(stream) {

             //* On insére le stream dans la balise <video></vidéo> 
        video.srcObject = stream;
        video.classList.remove('hidden')

            // le stream se lance - je vérifie si il est actif et j'initialise l'affichage.
            video.addEventListener("playing", () => {
                video.style.width ='320px';
                video.style.heigth ='240px';
                canvas.classList.remove('hidden');
                constrainsList.classList.remove('hidden');
                app.browserSuportedConstraints();
            });
 
            //*Appel functions take et reset picture
            app.takeCapture();
            app.resetCapture();
            
            //* stop du stream au click
            stop.addEventListener('click', function() {
            document.getElementById('constraintList').classList.add('hidden')
                stream.getTracks().forEach(function(track){
                track.stop();
                });
            // fin du stream je reset la dimention de la fenêtre vidéo
            video.classList.add('hidden');
            canvas.classList.add('hidden');
            alert('Souhaitez vous réellement arrêter de streamer ?');
            });//end listener

        })// end .then
        
        .catch(function(error) {
            app.dislayError(error);
        });
    }); // end click listener du bouton start

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
    //si on rentre ici c'est qu'il y a eu un clic donc je vérouille la colonne de liste des contraintes
    document.getElementById('constraintList').classList.add('hidden')
    //je place une balise dans le code html pour afficher les messsages d'erreurs.
    let errorElement = document.querySelector('#errorMsg');
    errorElement.innerHTML += '<p>' + error + '</p>';
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
        
        // j'affiche la taille actuelle de mon canvas
        // let target = document.getElementById('test');
        // let myP = document.createElement('h1');
        // let cwidth = canvas.width;
        // let cheight = canvas.height;
        // myP.append('canvas size = ' + cwidth + ' / ' + cheight)
        // target.append(myP)
        

        click_button.addEventListener('click', function() {
        canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height);
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