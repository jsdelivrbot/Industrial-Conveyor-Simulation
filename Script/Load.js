/*
*	This object organizes loading steps in a easy-to-manage sequence
*/

function LoadingStep(label, type, execute) {
	this.label = label;
	this.type = type;
	this.execute = execute;
}

const Load = (function() {
	var gathering = {},
		loaderInterface = new LoaderInterface();
	var stepList = [
		new LoadingStep("Initializing Loader Interface", "sync", () => {
			loaderInterface.init(document.getElementById("wrapper"));
		}),
		new LoadingStep("Initializing Loader Module", "sync", () => {
			gathering.userInterface = GUI;
			gathering.application = Application;
		}),
		new LoadingStep("Interpreting Url Parameters", "sync", () => {
			gathering.settings = new SettingManager();
		}),
		new LoadingStep("Initializing Performancer", "sync", () => {
			gathering.performancer = new Performancer();
			gathering.performancer.wrapper.style.zIndex = "1";
		}),
		new LoadingStep("Loading Images", "assync", (success, failure) => {
			var imageLoader = new ImageLoader();
			imageLoader.on("done", success);
			imageLoader.on("error", failure);
			/* Images are defined in /Script/Data/ImageCache.js */
			imageLoader.loadImages(imageLoaderCache.map(i=>i.fileName));
			gathering.imageLoader = imageLoader;
			gathering.imageList = imageLoader.getImages();
		}),
		new LoadingStep("Initializing World Handler Class", "sync", () => {
			var imageList = gathering.imageLoader.getImages();
			gathering.world = new WorldHandler();
			gathering.world.setImageList(gathering.imageList);
		}),
		new LoadingStep("Initializing ThreeJs", "sync", () => {
			gathering.userInterface.initRenderer(gathering);
			gathering.userInterface.initScene(gathering);
			gathering.userInterface.initCamera(gathering);
			gathering.renderer = gathering.userInterface.renderer;
			gathering.scene = gathering.userInterface.scene;
			gathering.camera = gathering.userInterface.camera;
		}),
		new LoadingStep("Initializing WebWorker", "sync", () => {
			if (typeof (Worker) === "undefined") {
				throw new Error("WebWorker is not supported by the browser");
			}
			var seed = gathering.settings.seed;
			gathering.world.initWebWorkers(gathering, seed);
		}),
		new LoadingStep("Initializing Camera Controller", "sync", () => {
			var camera = gathering.userInterface.camera;
			gathering.cinematic = new Cinematic(camera);
		}),
		new LoadingStep("Initializing Events", "sync", () => {
			gathering.application.initEvents(gathering);
			gathering.userInterface.initEvents(gathering);
		}),
		new LoadingStep("Distributing Variables", "sync", () => {
			gathering.world.collect(gathering);
			gathering.application.collect(gathering);
			gathering.cinematic.collect(gathering);
		}),
		new LoadingStep("Initializing Main Loop", "sync", () => {
			gathering.application.initMainLoop(gathering);
		}),
		new LoadingStep("Done", "assync", (success, failure) => {
			gathering.userInterface.showRenderer();
			setTimeout(function() {
				try {
					loaderInterface.finish();
				} catch(err) {
					failure(err)
				}
				success();
			}, 100);
		})
	];

	function showError(err, etype) {
		stopWatchDog();
		if (etype === "watchdog") {
			err.name = "Watchdog Intervention";
		} else if (etype === "assync") {
			err.name = "Assyncronous Error";
		} else if (etype === "assync-start") {
			err.name = "Assyncronous Setup Error";
		} else if (etype === "type") {
			err.name = "Incorrect Step Type";
		} else if (etype === "sync") {
			err.name = "Syncronous Error";
		} else if (etype === "unexpected-return") {
			err.name = "Loading Order Error";
		} else {
			err.name = "Unhandled Error";
		}
		loaderInterface.error(err.name, err.stack);
		console.error(err);
	}

	function startWatchDog(time = 5000) {
		stopWatchDog();
		watchdog = setTimeout(onWatchDogException, time);
	}

	function stopWatchDog() {
		if (watchdog !== undefined) {
			clearTimeout(watchdog);
			watchdog = undefined;
		}
	}

	function onWatchDogException() {
		var err = new Error("Loading Step Timeout");
		err.type = "Watchdog Error";
		setCurrentErrorStep(err)
		showError(err, "watchdog");
	}

	function setErrorPlace(err, place) {
		var stackLines = err.stack.split("\n");
		stackLines.splice(1,0,place);
		err.stack = stackLines.join("\n");
	}

	function setCurrentErrorStep(err) {
		setErrorPlace(err, `    at Loading Step ${stepIndex}: "${stepList[stepIndex-1].label}"`);
	}

	var stepIndex = 0;

	function onAssyncStepSucess(index) {
		if (watchdog === undefined) {
			return;
		}
		if (index === stepIndex) {
			stopWatchDog();
			step();
		} else {
			var err = new Error(`Step ${index} returned unexpectedly`);
			setErrorPlace(err, `At loading of step ${stepIndex}: ${stepList[stepIndex].label}`);
			showError(err, "unexpected-return");
		}
	}

	function onStepError(index, err) {
		if (index === stepIndex) {
			stopWatchDog();
			showError(err, "assync");
		} else {
			console.log(`Ignored error message from index ${index} because we're expecting ${stepIndex-1}`);
		}
	}

	var watchdog, currentStep;

	function step() {
		if (watchdog !== undefined) {
			return
		}
		if (stepIndex < stepList.length) {
			currentStep = stepList[stepIndex];
			stepIndex++;
			loaderInterface.update(currentStep.label, stepIndex/stepList.length);
			if (currentStep.type === "assync") {
				startWatchDog();
				try {
					currentStep.execute(onAssyncStepSucess.bind(currentStep, stepIndex), onStepError.bind(currentStep, stepIndex));
				} catch(err) {
					setCurrentErrorStep(err);
					showError(err, "assync-start");
					return;
				}
				//break;
			} else if (currentStep.type === "sync") {
				try {
					currentStep.execute()
				} catch(err) {
					setCurrentErrorStep(err);
					showError(err, "sync");
					return;
				}
				setTimeout(step, 100);
			} else {
				var err = new TypeError(`Unkown Loading Step Type: ${currentStep.type}`);
				setCurrentErrorStep(err);
				showError(err, "type");
			}
		}
	}
	return step;
})();

window.addEventListener("load", Load);

/*
var a = function(p1, p2) {
	console.log(this, p1, p2)
}
window.a("1","2");
var b = a.bind({}, 5);
b(4);
*/