export const keysHeld = new Set();

export function initKeyboard() {
	document.addEventListener('keydown', (e) => {
		keysHeld.add(e.key);
	});

	document.addEventListener('keyup', (e) => {
		keysHeld.delete(e.key);
	});
}

export function isKeyDown(key) {
	return keysHeld.has(key);
}

if ('ontouchstart' in document.documentElement) {
	document.getElementById('left').addEventListener('touchstart', () => {
		keysHeld.add('ArrowLeft');
	});
	document.getElementById('left').addEventListener('touchend', () => {
		keysHeld.delete('ArrowLeft');
	});
	document.getElementById('right').addEventListener('touchstart', () => {
		keysHeld.add('ArrowRight');
	});
	document.getElementById('right').addEventListener('touchend', () => {
		keysHeld.delete('ArrowRight');
	});
	document.getElementById('jump').addEventListener('touchstart', () => {
		keysHeld.add(' ');
	});
	document.getElementById('jump').addEventListener('touchend', () => {
		keysHeld.delete(' ');
	});
} else {
	document.getElementById('mobile').style.display = 'none';
}

document.body.oncontextmenu = () => false;
