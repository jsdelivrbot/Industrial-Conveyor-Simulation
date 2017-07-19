function WorldHandler() {
	this.count = 0;
}

WorldHandler.prototype = {
	constructor: WorldHandler,
	setImageList: function(imageList) {
		this.imageList = imageList;
	},
	collect: function(gatherer) {
		this.scene = gatherer.scene || (()=>{throw new Error("Couldn't retrieve scene")})();
	},
	initWebWorkers: function(gatherer, seed) {

	},
	update: function(delta) {
		if (this.count === 0) {
			var material = new THREE.MeshLambertMaterial({
				color: 0x222222
			});
			this.a = new THREE.Mesh(new THREE.CubeGeometry(1,0.5,1), material);
			this.scene.add(this.a);
		}
		this.a.rotation.set(this.a.rotation.x-0.002,0,this.a.rotation.z+0.01);
		this.count ++;
	}
}