var Map = React.createClass({
    displayName: 'Map',
    getInitialState: function() {
        return {
            mapOptions: {
                zoom: 15,
                center: null,
                mapTypeId: null,
                mapTypeControlOptions: null,
                disableDoubleClickZoom: true,
                scrollwheel: false,
                draggableCursor: 'crosshair'
            },
            map: null,
            path: null,
            service: null
        };
    },
    componentWillMount: function() {
        this.loadScript();
    },
    initialize: function() {
        //Set up map options now that we have reference to google maps
        var mapOptions = this.state.mapOptions;
        mapOptions.center = new google.maps.LatLng(40.766088, -111.890743);
        mapOptions.mapTypeId = google.maps.MapTypeId.HYBRID;
        mapOptions.mapTypeControlOptions = {
            mapTypeIds: [google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.HYBRID,
                google.maps.MapTypeId.SATELLITE]
        };

        this.state.map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
    },
    loadScript: function() {
        var self = this;
        window.initializeMap = function() {
            self.initialize();
        };

        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=true&callback=initializeMap';
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