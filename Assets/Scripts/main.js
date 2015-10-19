//Have to leave this outside React components for now to get map to show.
function initialize() {
    var mapOptions = {
        zoom: 10,
        center: new google.maps.LatLng(40.766088, -111.890743)
    };

    var map = new google.maps.Map(document.getElementById('map-canvas'),
        mapOptions);
}

var Map = React.createClass({
    displayName: 'Map',
    componentWillMount: function() {
        this.loadScript();
    },
    loadScript: function() {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=true&callback=initialize';
        document.body.appendChild(script);
    },
    render: function() {
       return (
           React.createElement('div', {id: 'map-canvas'}, null)
       )
    }
});

var Main = React.createClass({
    render: function() {
        return (
            React.createElement(Map, null, null)
        )
    }
});

ReactDOM.render(React.createElement(Main, null, null), document.getElementById('container'));