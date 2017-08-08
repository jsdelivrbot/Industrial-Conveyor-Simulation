importScripts("../Libraries/JonasWagner-SimplexNoise.js", "../Libraries/alea.min.js", "../../Classes/WorldDataArray.js");

var noise = {noise3D: () => Math.random()};
var sensitivity = 0.5;

function setSeed(seed) {
	if (typeof seed === "number" && !isNaN(seed))
		noise = new SimplexNoise((new Alea(seed)).next);
}

function setSensitivity(sens) {
	if (typeof sens === "number" && !isNaN(sens))
		sensitivity = sens;
}

function getBlockStateRaw(x, y, z) {
	return (noise.noise3D(x, y, z) < sensitivity);
}

function isPoint(x, y, z) {
	if (getBlockStateRaw(x, y, z)) {
		return (
			!getBlockStateRaw(x+1,y,z) &&
			!getBlockStateRaw(x,y+1,z) &&
			!getBlockStateRaw(x,y,z+1) &&
			!getBlockStateRaw(x+1,y+1,z) &&
			!getBlockStateRaw(x,y+1,z+1) &&
			!getBlockStateRaw(x+1,y,z+1) &&
			!getBlockStateRaw(x-1,y,z) &&
			!getBlockStateRaw(x,y-1,z) &&
			!getBlockStateRaw(x,y,z-1) &&
			!getBlockStateRaw(x-1,y-1,z) &&
			!getBlockStateRaw(x,y-1,z-1) &&
			!getBlockStateRaw(x-1,y,z-1)
		)
	}
}

function createChunk(x, y, z) {
	var i,j,k,r = new WorldDataArray(16, 16, 16);
	x = x * 16+8;
	y = y * 16+8;
	z = z * 16+8;
	for (i = x-16; i < x; i++) {
		for (j = y-16; j < y; j++) {
			for (k = z-16; k < z; k++) {
				r.set(i,j,k,isPoint(i/10,j/10,k/10)?1:0);
			}
		}	
	}
}

function handleMessage(message) {
	var text = message.data;
	if (text === "ping") {
		postMessage("ping");
	} else if (text === "die") {
		postMessage("dead");
		self.close();
	} else {
		text = text.split(" ");
		if (text[0] === "create" && text.length === 4) {
			var world = createChunk(parseInt(text[1]), parseInt(text[2]), parseInt(text[3]));
			postMessage("w"+world.getCount()+","+world.encode());
		} else if (text[0] === "seed" && text.length === 2) {
			setSeed(parseFloat(text[1]));
			postMessage("done");
		} else if (text[0] === "sensitivity" && text.length === 2) {
			setSensitivity(parseFloat(text[1]));
			postMessage("done");
		} else {
			postMessage("unknown command");
		}
	}
}

self.addEventListener('message', handleMessage, false);