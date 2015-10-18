chrome.app.runtime.onLaunched.addListener(function() {
        chrome.app.window.create('popup.html', {
            'id' : 'mainPopup',
            'outerBounds': {
                'width': 660,
                'height': 490
            }
        });
    }
);