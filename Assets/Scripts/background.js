chrome.app.runtime.onLaunched.addListener(function() {
    chrome.app.window.create('window.html', {
        'id':'mainWindow',
        'outerBounds': {
            'width': 640,
            'height': 480
        }
    });
});