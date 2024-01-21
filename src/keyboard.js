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
