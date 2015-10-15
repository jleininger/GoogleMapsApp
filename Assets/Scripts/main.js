var map;

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        center: {lat: 40.7660449, lng: -111.8910491},
        zoom: 8
    });
}