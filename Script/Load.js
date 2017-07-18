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
			err.name = "Syncronous Malfunction";
		} else if (etype === "unexpected-return") {
			err.name = "Loading Order Error";
		} else {
			err.name = "Unhandled Error";
		}
		loaderInterface.error(err.name, err.stack);
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
		var err = new Error("Assyncronous loading step timeout");
		setErrorPlace(err, `At loading of step ${stepIndex}: ${stepList[stepIndex].label}`);
		showError(err, "watchdog");
	}

	function setErrorPlace(err, place) {
		err.stack = place+"\n"+err.stack;
		//err.stack = err.stack.split("\n").splice(0, 0, place).join("\n");
	}

	var stepIndex = 0;

	function onAssyncStepSucess(index) {
		if (index+1 === stepIndex) {
			stopWatchDog();
			step();
		} else {
			var err = new Error(`Step ${index} returned unexpectedly`);
			setErrorPlace(err, `At loading of step ${stepIndex}: ${stepList[stepIndex].label}`);
			showError(err, "unexpected-return");
		}
	}

	function onAssyncStepError(index, err) {
		if (index === stepIndex) {
			stopWatchDog();
			showError(err, "assync");
		}
	}

	var watchdog, currentStep;

	function step() {
		if (watchdog !== undefined) {
			return
		}
		var limit = 100;
		//while (stepIndex < stepList.length && ((limit--) > 0)) {
			currentStep = stepList[stepIndex];
			loaderInterface.update(currentStep.label, stepIndex/stepList.length);
			if (currentStep.type === "assync") {
				startWatchDog();
				try {
					currentStep.execute(onAssyncStepSucess.bind(currentStep, stepIndex), onAssyncStepError.bind(currentStep, stepIndex));
				} catch(err) {
					onStepError(err, "assync-start");
					return;
				}
				stepIndex++;
				//break;
			} else if (currentStep.type === "sync") {
				try {
					currentStep.execute()
				} catch(err) {
					onStepError(err, "sync");
					return;
				}
				stepIndex++;
				setTimeout(step, 10);
			} else {
				var err = new Error(`Unkown Loading Step Type: ${currentStep.type}`);
				setErrorPlace(err, `loading of step ${stepIndex}`);
				onStepError(err, "type");
			}
		//}
	}

	return step;
})();

window.addEventListener("load", Load);