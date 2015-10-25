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
                zoomControl: true,
                draggable: true,
                disableDoubleClickZoom: true,
                scrollwheel: true,
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
       return (
           <div id='map-canvas'></div>
       );
    }
});

var Locations = React.createClass({
    getInitialState: function() {
        return {
            allPoints: [],
            startPoint: null,
            endPoint: null
        };
    },
    getPoint: function() {
	//	var geocoder = new google.maps.Geocoder;
	//	var pointOne = pointsList[Math.floor(Math.random() * 3)];
	//	//console.log(pointOne.x);
	//	var pointTwo = pointsList[Math.floor(Math.random() * 3)];
	//	//console.log(pointTwo.x);
	//	// pick two points from array
	//	var startLatLng = {lat: parseFloat(pointOne.x), lng: parseFloat(pointOne.y)};
	//	var startLocation = geocoder.geocode({'location': startLatLng},function(results, status) {
	//	if(status === google.maps.GeocoderStatus.OK) {
	//		if(results[0]) {
	//			console.log(results[0].formatted_address);
	//			this.setState({
	//				startPoint:results[0].formatted_address);
	//			})
	//		} else {
	//			console.log('results 0 not there');
	//		}
	//	} else {
	//		console.log('uh oh: ' + status);
	//	}
	//	var endLatLng = {lat: parseFloat(pointTwo.x), lng: parseFloat(pointTwo.y)};
	//	var endLocation = geocoder.geocode({'location': startLatLng},function(results, status) {
	//	if(status === google.maps.GeocoderStatus.OK) {
	//		if(results[0]) {
	//			console.log(results[0].formatted_address);
	//			this.setState({
	//				endPoint:results[0].formatted_address);
	//			})
	//		} else {
	//			console.log('results 0 not there');
	//		}
	//	} else {
	//		console.log('uh oh: ' + status);
	//	}
	//
	//});
    },
    render: function() {
        return (
            <div className="locations">
                <h3>Start Point:</h3>
                <h4>{this.state.startPoint}</h4>
                <h3>End Point:</h3>
                <h4>{this.state.endPoint}</h4>
            </div>
        )
    }
});

var CountDownTimer = React.createClass({
    getInitialState: function() {
        return {
            timeDisplay: '00:00',
            timerRunning: false
        };
    },
    start: function(duration, gameOverEvent) {
        var self = this,
            startTime = Date.now(),
            deltaTime,
            minutes,
            seconds,
            display,
            timerInterval;

        function countdown() {
            deltaTime = duration - (((Date.now() - startTime) / 1000) | 0);
            minutes = (deltaTime / 60) | 0;
            seconds = (deltaTime % 60) | 0;

            if(minutes === 0 && seconds === 0) {
                //gameOverEvent();
                clearInterval(timerInterval);
            }

            minutes = (minutes < 10) ? "0" + minutes : minutes;
            seconds = (seconds < 10) ? "0" + seconds : seconds;

            display = minutes + ":" + seconds;

            if(deltaTime <= 0) {
                startTime = Date.now() + 1000;
            }

            self.setState({timeDisplay: display});
        }

        countdown();
        timerInterval = setInterval(countdown, 1000);
        this.state.timerRunning = true;
    },
    render: function() {
        return (
            <div>
                <h2 className='countdown'>{this.state.timeDisplay}</h2>
                <button onClick={this.start.bind(null, 10)} disabled={this.state.timerRunning}>Start Timer</button>
            </div>
        )
    }
});

var GameControls = React.createClass({
    render: function() {
        return (
            <div id='gameControls' className='game-controls'>
                <h1>Fastest Route</h1>
                <h3>Time Left:</h3>
                <CountDownTimer />
                <Locations />
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