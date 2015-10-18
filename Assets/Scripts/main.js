var Map = React.createClass({
    displayName: 'Map',
    componentWillMount: function() {
        this.loadScript();
    },
    componentDidMount: function() {
        var scope = this;
        setTimeout(function() {
            scope.initialize();
        }, 5000);
    },
    initialize: function() {
        var mapOptions = {
            zoom: 8,
            center: new google.maps.LatLng(-34.397, 150.644)
        };

        var map = new google.maps.Map(document.getElementById('map-canvas'),
            mapOptions);
    },
    loadScript: function() {
        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false';
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