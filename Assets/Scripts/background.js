chrome.app.runtime.onLaunched.addListener(function() {
        chrome.app.window.create('popup.html', {
            'id' : 'mainPopup',
            'outerBounds': {
                'width': 1020,
                'height': 620
            }
        });
    }
);