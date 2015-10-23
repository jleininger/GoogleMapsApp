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
                disableDoubleClickZoom: false,
                scrollwheel: false,
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
        google.maps.event.addListener(this.state.map, 'rightclick', this.testDistance);

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
        script.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=true&callback=initializeMap&libraries=places';
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
    testDistance: function() {
        var path = this.state.path;
        this.getTotalDistanceFromRoute(path.getAt(path.getLength() - 2), path.getAt(path.getLength() - 1));
    },
    getTotalDistanceFromRoute: function(startPoint, endPoint) {
        this.state.service.route({
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