const appMap = {

init:function() {
    
    console.log('Mapinit');
    appMap.leafletInit();

},


leafletInit:function(){

    //* initialisatio de la carte sur la position GPS d'AGEN
    var map = L.map('map').setView([44.2036587, 0.6091369], 9);
    
     //* marqueur de test de base
    L.marker([44.2136587, 0.6091369]).addTo(map)
        .bindPopup('PopUp Info de mon Marqueur')
        //.openPopup();

    //*Layer visule de la carte fixé sur 180px dans le css à voir pour l'intégration
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {    
    //attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    //todo je crée des fixtures de marqueurs
    for (let step = 0; step < 15; step++) {

    //generate random picture and append to marker popup
    let poUpPicture = 'https://picsum.photos/100/150?random=' + Math.floor(Math.random() * 100);
   
    //generate random coords
    let lat = appMap.getRandomCoords(44, 44.6, 20);
    let lng = appMap.getRandomCoords(0, 0.6, 10);

    let myPicturePoUp = "<img src=" + poUpPicture + "/>"

    //*création d'un marqueur géolocalisé puis ajouté à la map
    L.marker([lat, lng]).addTo(map)
        //*popUp du marqueur qui doit pouvoir recevoir un template ou autre
        .bindPopup(myPicturePoUp)
        //* Si décommenté le popUp du marquer est ouvert par défaut au chargement
        //.openPopup();

    }//todo endFor

   
    },//end leafletInit

    //*random coordonates générator
    getRandomCoords: function(from, to, fixed) {
    return (Math.random() * (to - from) + from).toFixed(fixed) * 1;
    //.toFixed() returns string, so ' * 1' is a trick to convert to number
    },








//* version avec Token
//     L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}', {
//     attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
//     maxZoom: 18,
//     id: 'mapbox/streets-v11',
//     tileSize: 512,
//     zoomOffset: -1,
//     accessToken: 'your.mapbox.access.token'
// }).addTo(map)



}








document.addEventListener('DOMContentLoaded', appMap.init)