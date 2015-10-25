var Map = React.createClass({
    getInitialState: function() {
        return {
            mapOptions: {
                zoom: 17,
                center: null,
                mapTypeId: null,
                mapTypeControlOptions: null,
                navigationControl: false,
                scaleControl: false,
                zoomControl: false,
                draggable: false,
                disableDoubleClickZoom: true,
                scrollwheel: false,
                draggableCursor: 'crosshair'
            },
            map: null,
            path: null,
            poly: null,
            directionsService: null,
            placesService: null,
            destination: null
        };
    },
    componentWillMount: function() {
        this.loadScript();
    },
    initialize: function() {
        var self, mapOptions, map, path, directionsService, placesService, poly;

        self = this;
        //Set up map options now that we have reference to google maps
        mapOptions = this.state.mapOptions;
        mapOptions.center = new google.maps.LatLng(40.766088, -111.890743);
        mapOptions.mapTypeId = google.maps.MapTypeId.HYBRID;
        mapOptions.mapTypeControlOptions = {
            mapTypeIds: [google.maps.MapTypeId.ROADMAP, google.maps.MapTypeId.HYBRID,
                google.maps.MapTypeId.SATELLITE]
        };

        map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);
        path = new google.maps.MVCArray();
        path.push(mapOptions.center);
        directionsService = new google.maps.DirectionsService();
        placesService = new google.maps.places.PlacesService(map);
        poly = new google.maps.Polyline({map: map, strokeColor: "#0000FF"});
        poly.setPath(path);
        google.maps.event.addListener(map, 'click', function(evt) {
            self.addPoint(evt, function(nextStop) {
                self.state.map.setCenter(nextStop);
            });
        });

        this.setState({
            mapOptions: mapOptions,
            map: map,
            path: path,
            directionsService: directionsService,
            placesService: placesService,
            poly: poly
        });

        this.createMarker({name: 'Your current location', geometry: { location: mapOptions.center}});
        this.findNearbyDestination(self.state.mapOptions.center, function(des) {
            self.createMarker(des);
            self.setState({destination: des});
        });
    },
    loadScript: function() {
        var self = this;
        window.initializeMap = function() {
            self.initialize();
        };

        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=places&sensor=true&callback=initializeMap';
        document.body.appendChild(script);
    },
    setMapToUsersCurrentLocaion: function(map) {
        //This does not work in a chrome app
        if(navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(function(position) {
                var position = new google.maps.LatLng(
                    position.coords.latitude,
                    position.coords.longitude
                );

                map.setCenter(position);
            });
        }
    },
    addPoint: function(evt, next) {
        var path = this.state.path,
            poly = this.state.poly,
            directionsService = this.state.directionsService;

        directionsService.route({
            origin: path.getAt(path.getLength() - 1),
            destination: evt.latLng,
            travelMode: google.maps.DirectionsTravelMode.DRIVING
        }, function(result, status) {
            if(status == google.maps.DirectionsStatus.OK) {
                var routesLength = result.routes[0].overview_path.length;
                for(var i = 0; i < routesLength; i++) {
                    path.push(result.routes[0].overview_path[i]);
                    next(result.routes[0].overview_path[i]);
                }
            }
        });
    },
    testDistance: function() {
        var path = this.state.path;
        this.getTotalDistanceFromRoute(path.getAt(path.getLength() - 2), path.getAt(path.getLength() - 1));
    },
    getTotalDistanceFromRoute: function(startPoint, endPoint) {
        this.state.directionsService.route({
            origin: startPoint,
            destination: endPoint,
            travelMode: google.maps.DirectionsTravelMode.DRIVING
        }, function(result, status) {
            if(status == google.maps.DirectionsStatus.OK) {
                console.log('Total Distance', result.routes[0].legs[0].distance.value);
            }
        });
    },
    getTotalTimeFromRoute: function() {

    },
    findNearbyDestination: function(startLoc, callback) {
        var request = {
                location: startLoc,
                radius: 10000,
                types: ['store']
            },
            placesService = this.state.placesService;

        placesService.nearbySearch(request, function(results, status) {
            if(status == google.maps.places.PlacesServiceStatus.OK) {
                callback(results[Math.floor(Math.random() * results.length)]);
            }
        });
    },
    createMarker: function(place) {
        new google.maps.Marker({
            position: place.geometry.location,
            map: this.state.map,
            title: place.name,
            animation: google.maps.Animation.DROP
        });
    },
    render: function() {
        var destination = this.state.destination || 'Getting Destination',
            destinationName = 'Getting Destination',
            destinationAddress = 'Getting Destination';

        if(destination != 'Getting Destination') {
            destinationName = destination.name;
            destinationAddress = destination.vicinity;
        }

       return (
           <div id='game'>
               <GameStart destinationName={destinationName} destinationAddress={destinationAddress} />
               <div id='map-canvas'></div>
               <GameControls />
           </div>
       );
    }
});

var CountDownTimer = React.createClass({
    getInitialState: function() {
        return {
            timeDisplay: '00:00'
        };
    },
    statics: {
        startCountdown: function(duration, gameOverEvent) {
            var startTime = Date.now(),
                deltaTime,
                minutes,
                seconds,
                display,
                timerInterval;

            function countdown() {
                deltaTime = duration - (((Date.now() - startTime) / 1000) | 0);
                minutes = (deltaTime / 60) | 0;
                seconds = (deltaTime % 60) | 0;

                if (minutes === 0 && seconds === 0) {
                    gameOverEvent();
                    clearInterval(timerInterval);
                }

                minutes = (minutes < 10) ? "0" + minutes : minutes;
                seconds = (seconds < 10) ? "0" + seconds : seconds;

                display = minutes + ":" + seconds;

                if (deltaTime <= 0) {
                    startTime = Date.now() + 1000;
                }

                document.getElementById('countdown').innerHTML = display;
            }

            countdown();
            timerInterval = setInterval(countdown, 1000);
        }
    },
    render: function() {
        return (
            <div>
                <h2 id='countdown' className='countdown'>{this.state.timeDisplay}</h2>
            </div>
        )
    }
});

var GameStart = React.createClass({
    getInitialState: function() {
        return {
            visible: true
        }
    },
    hide: function() {
        this.setState({visible: false});
        CountDownTimer.startCountdown(30, function() {
            console.log('This is a mess');
        });
    },
    render: function() {
        return (
            <div className={(this.state.visible) ? 'visible' : 'hidden'}>
                <div id='game-start-message' className='game-start-message'>
                    <h1>Welcome to Fastest Route!</h1>
                    <p>You are an Uber driver and you need to get your passengers to their destination
                        as quickly and as efficiently as possible.</p>
                    <h2>Destination:</h2>
                    <h4>{this.props.destinationName}</h4>
                    <h2>at:</h2>
                    <h4>{this.props.destinationAddress}</h4>
                    <button onClick={this.hide}>Start</button>
                </div>
                <div className='black-overlay'></div>
            </div>
        );
    }
});

var GameControls = React.createClass({
    render: function() {
        return (
            <div id='gameControls' className='game-controls'>
                <h1>Fastest Route</h1>
                <h3>Time Left:</h3>
                <CountDownTimer countdownTime={this.props.countdownTime} />
            </div>
        )
    }
});

ReactDOM.render(<Map />, document.getElementById('container'));