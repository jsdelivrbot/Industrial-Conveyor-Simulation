const ThreejsSetup = (function() {
	return {
		createRenderer: function(antialias = true) {
			let renderer, rendererConfig = {
				antialias: antialias,
				alpha: false
			}
			try {
				renderer = new THREE.WebGLRenderer(rendererConfig);
				renderer.setClearColor(getComputedStyle(document.body)["background-color"]);
			} catch (err) {
				throw new Error("WebGl is not supported by the browser");
			}
			return renderer;
		},
		createScene: function() {
			let scene = new THREE.Scene();
			function addLight(name, position, intensity) {
				let light = new THREE.DirectionalLight(0xffffff,intensity);
				light.position.copy(position);
				light.name = name;
				scene.add(light);
				return light;
			}
			let lights = [
			addLight("Top",		{ x: 0, y: 1, z: 0 },	2.935),
			addLight("Front",	{ x: 0, y: 0, z: -1 },	2.382),
			addLight("Back",	{ x: 0, y: 0, z: 1 },	2.3548),
			addLight("Left",	{ x: -1, y: 0, z: 0 },	1.7764),
			addLight("Right",	{ x: 1, y: 0, z: 0 },	1.7742),
			addLight("Bottom",	{ x: 0, y: -1, z: 0 },	1.5161)];
			return scene;
		},
		createCamera: function() {
			var camera = new THREE.PerspectiveCamera(85,window.innerWidth / window.innerHeight,0.2,100);
			/* Position camera so that a small object at the origin can be seen */
			camera.position.set(0, 0, 4);
			return camera;
		}
	}
})();