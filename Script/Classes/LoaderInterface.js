function LoaderInterface() {
	this.headers = [];
}

LoaderInterface.prototype = {
	constructor: LoaderInterface,
	init: function(wrapper) {
		this.headers = new Array(...wrapper.children);
		this.headers[1].innerText = "Started";
	},
	error: function(title, stack) {
		this.headers[0].innerText = title;
		this.headers[1].innerHTML = `<div style="font-size:0.5em">${stack.split("\n").join("<br>")}</div>`;
		this.headers[2].innerHTML = "";
	},
	update: function(text, percent) {
		if (this.headers.length === 0)
			return
		text.split('\n').some((line, headerIndex) => {
			if (headerIndex+1 < this.headers.length) {
				this.headers[headerIndex+1].innerText = line;
				return false;
			}
			return true;
		});
		this.headers[this.headers.length-1].innerText = (percent*100|0)+"%";
	},
	finish: function() {
		var mask = document.getElementById("mask");
		if (mask) {
			mask.style.display = "none";
		} else {
			this.error("HTML Document Error", (new Error(`Unable to find "mask" on the document`)).stack);
		}
		this.headers[1].innerText = "Done";
	}
}