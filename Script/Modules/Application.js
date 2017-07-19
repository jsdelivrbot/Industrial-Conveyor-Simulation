const Application = (function() {
	var sm = new StateMachine({
		"unitialized": {},
		"loading": {},
		"normal": {}
	});

	var logDifference, updateCinematic, updateWorld, renderFunc;

	var difference, timeStamp, lastTimeStamp = 0;

	function loop() {
		timeStamp = performance.now();
		difference = timeStamp - lastTimeStamp;
		update(difference);
		lastTimeStamp = timeStamp;
		window.requestAnimationFrame(loop);
	}

	function update(difference) {
		logDifference(difference);
		updateCinematic(difference);
		updateWorld(difference/16);
		renderFunc();
	}

	return {
		initEvents: function() {
			sm.state = "loading";
			window.addEventListener("mousemove", this.onCursorMove.bind(this));
			window.addEventListener("keydown", this.onKeyDown.bind(this));
			window.addEventListener("touchmove", this.onCursorMove.bind(this));
		},
		initMainLoop: function(gatherer) {
			sm.state = "normal";
			logDifference = gatherer.performancer.update.bind(gatherer.performancer);
			updateWorld = gatherer.world.update.bind(gatherer.world);
			renderFunc = gatherer.userInterface.render.bind(gatherer.userInterface);
			updateCinematic = gatherer.cinematic.update.bind(gatherer.cinematic);
			update(16);
			window.requestAnimationFrame(loop);
		},
		collect: function(gatherer) {
			this.gatherer = gatherer || (()=>{throw new Error("Couldn't retrieve gatherer")})();
		},
		onCursorMove: function(event) {
			
		},
		onKeyDown: function(event) {
			if (event.code === "KeyS")
				update(16);
			if (event.code === "KeyR") {
				if (Application.clear) {
					Application.clear = Application.clear();
				} else {
					Application.reset();
				}
			}
		},
		clear: function() {
			this.reset();
		},
		reset: function() {
			
		}
	}
}());
