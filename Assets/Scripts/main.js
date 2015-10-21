var Map = React.createClass({
    displayName: 'Map',
    getInitialState: function() {
        return {
            mapOptions: {
                zoom: 17,
                center: null,
                mapTypeId: null,
                mapTypeControlOptions: null,
                disableDoubleClickZoom: true,
                scrollwheel: true,
                draggableCursor: 'crosshair'
            },
            map: null,
            path: null,
            poly: null,
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
        this.state.path = new google.maps.MVCArray();
        this.state.service = new google.maps.DirectionsService();
        this.state.poly = new google.maps.Polyline({map: this.state.map, strokeColor: "#0000FF"});
        google.maps.event.addListener(this.state.map, 'click', this.addPoint);
        google.maps.event.addListener(this.state.map, 'rightclick', this.removePoint);

        this.setState({
            mapOptions: mapOptions,
            map: this.state.map,
            path: this.state.path,
            service: this.state.service,
            poly: this.state.poly
        });
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
    addPoint: function(evt) {
        var path = this.state.path,
            poly = this.state.poly,
            service = this.state.service;

        if(path.getLength() === 0) {
            path.push(evt.latLng);
            poly.setPath(path);
        } else {
            service.route({
                origin: path.getAt(path.getLength() - 1),
                destination: evt.latLng,
                travelMode: google.maps.DirectionsTravelMode.DRIVING
            }, function(result, status) {
                if(status == google.maps.DirectionsStatus.OK) {
                    var routesLength = result.routes[0].overview_path.length;
                    for(var i = 0; i < routesLength; i++) {
                        path.push(result.routes[0].overview_path[i]);
                    }
                }
            });
        }
    },
    removePoint: function() {

    },
    render: function() {
       return (
           <div id='map-canvas'></div>
       );
    }
});

var GameControls = React.createClass({
    render: function() {
        return (
            <div id='gameControls' className='game-controls'>
                <h1>Fastest Route</h1>
                <h3>Time Left:</h3>
                <h2>00:00</h2>
            </div>
        )
    }
});

var Main = React.createClass({
    render: function() {
        return (
            <div id='game'>
                <Map />
                <GameControls />
            </div>
        )
    }
});

ReactDOM.render(<Main />, document.getElementById('container'));