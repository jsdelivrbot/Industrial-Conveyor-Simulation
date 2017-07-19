const GUI = (function() {
	return {
		initRenderer: function(gatherer) {
			this.renderer = ThreejsSetup.createRenderer(gatherer.settings.antialias);
			this.renderer.domElement.setAttribute("style", "position: absolute;	top: 0;	left: 0; display: block; opacity: 0.01");
			document.body.appendChild(this.renderer.domElement);
		},
		showRenderer: function() {
			this.renderer.domElement.style.opacity = "inherit";
			this.renderer.domElement.style.display = "block";
		},
		initScene: function(gatherer) {
			this.scene = ThreejsSetup.createScene();
		},
		initCamera: function(gatherer) {
			this.camera = ThreejsSetup.createCamera();
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
