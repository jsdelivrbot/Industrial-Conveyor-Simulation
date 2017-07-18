const GUI = (function() {
	return {
		initRenderer: function(gatherer) {
			let rendererConfig = {
				antialias: gatherer.settings.antialias,
				alpha: false,
				clearColor: getComputedStyle(document.body)["background-color"]
			}
			try {
				this.renderer = new THREE.WebGLRenderer(rendererConfig);
			} catch (err) {
				throw new Error("WebGl is not supported by the browser");
			}
			this.renderer.domElement.setAttribute("style", "position: absolute;	top: 0;	left: 0; display: block; opacity: 0.9");
			document.body.appendChild(this.renderer.domElement);
		},
		initScene: function(gatherer) {
			var scene = new THREE.Scene();
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
			this.scene = scene;
		},
		initCamera: function(gatherer) {
			this.camera = new THREE.PerspectiveCamera(85,window.innerWidth / window.innerHeight,0.2,100);
			this.camera.position.set(0, 0, 4);
			this.onResize();
		},
		initEvents: function() {
			addEventListener('resize', this.onResize.bind(this), false);
		},
		onResize: function() {
			if (this.camera) {
				this.camera.aspect = window.innerWidth / window.innerHeight;
				this.camera.updateProjectionMatrix();
			}
			if (this.renderer) {
				this.renderer.setSize(window.innerWidth, window.innerHeight);
			}
			this.render();
		},
		render: function() {
			this.renderer.render(this.scene, this.camera);
		}
	}
})();
