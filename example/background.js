chrome.app.runtime.onLaunched.addListener(function() 
	{
		chrome.app.window.create('popup.html', {
			'id' : 'MyWindowID',
			'outerBounds': {
				'width': 400,
				'height': 550
			}
		});
	}
);