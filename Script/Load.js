/*
*	This object organizes loading steps in a easy-to-manage sequence
*/
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
			gathering.application.setPerformancer(gathering.performancer);
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
		new LoadingStep("Initializing WebWorker", "sync", () => {
			if (typeof (Worker) === "undefined") {
				throw new Error("WebWorker is not supported by the browser");
			}
			var seed = gathering.settings.seed;
			gathering.world.initWebWorkers(seed);
		}),
		new LoadingStep("Initializing ThreeJs", "sync", () => {
			gathering.userInterface.initRenderer(gathering);
			gathering.userInterface.initScene(gathering);
			gathering.userInterface.initCamera(gathering);
			gathering.renderer = gathering.userInterface.renderer;
			gathering.scene = gathering.userInterface.scene;
			gathering.camera = gathering.userInterface.camera;
		}),
		new LoadingStep("Initializing Camera Controller", "sync", () => {
			var camera = gathering.userInterface.camera;
			gathering.cinematic = new Cinematic(camera);
		}),
		new LoadingStep("Initializing Events", "sync", () => {
			gathering.application.initEvents(gathering);
			gathering.userInterface.initEvents(gathering);
		}),
		new LoadingStep("Initializing Main Loop", "sync", () => {
			gathering.application.initMainLoop(gathering);
		}),
		new LoadingStep("Finishing Load Progress", "sync", () => {
			loaderInterface.finish();
		})
	];

	function showError(err) {
		// Todo: Make this better
		console.error(err);
	}

	function onStepSucess() {
		stopWatchDog();
		/* Continue process */
		step();
	}

	function onStepError(err) {
		stopWatchDog();
		showError(err);
	}

	function startWatchDog() {
		stopWatchDog();
		watchdog = setTimeout(onWatchDogException, 5000);
	}

	function stopWatchDog() {
		if (watchdog !== undefined) {
			clearTimeout(watchdog);
			watchdog = undefined;
		}
	}

	function onWatchDogException() {
		console.log("Watchdog Intervention");
		showError(new Error("Watchdog Intervention"));
	}

	var stepIndex = 0;
	var watchdog, currentStep;

	function step() {
		if (watchdog !== undefined) {
			return
		}
		var limit = 100;
		while (stepIndex < stepList.length && ((limit--) > 0)) {
			currentStep = stepList[stepIndex];
			if (currentStep.type === "assync") {
				startWatchDog();
				try {
					currentStep.execute(onStepSucess, onStepError);
				} catch(err) {
					onStepError(err);
					//return;
				}
				stepIndex++;
				break;
			} else if (currentStep.type === "sync") {
				try {
					currentStep.execute()
				} catch(err) {
					onStepError(err);
					//return;
				}
				stepIndex++;
			} else {
				console.log("Unknown type: ", currentStep.type);
			}
		}
	}

	return step;
})();

window.addEventListener("load", Load);