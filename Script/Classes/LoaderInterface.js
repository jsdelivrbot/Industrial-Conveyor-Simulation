function LoaderInterface() {
	
}

LoaderInterface.prototype = {
	constructor: LoaderInterface,
	init: function(wrapper) {
		this.headers = new Array(...wrapper.children);
		this.headers[1].innerText = "Started";
	},
	finish: function() {
		this.headers[1].innerText = "Done";
	}
}