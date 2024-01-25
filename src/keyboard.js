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

export function isGoingLeft() {
	return isKeyDown('ArrowLeft') || isKeyDown('a');
}

export function isGoingRight() {
	return isKeyDown('ArrowRight') || isKeyDown('d');
}

export function isHoldingSpace() {
	return isKeyDown(' ') || isKeyDown('ArrowDown') || isKeyDown('s');
}

if ('ontouchstart' in document.documentElement) {
	const touchEvents = {
		'left': 'ArrowLeft',
		'right': 'ArrowRight',
		'jump': ' '
	};

	for (const [elementId, key] of Object.entries(touchEvents)) {
		const element = document.getElementById(elementId);
		element.addEventListener('touchstart', (ev) => {
			keysHeld.add(key);
			ev.preventDefault();
		});
		element.addEventListener('touchend', (ev) => {
			keysHeld.delete(key);
			ev.preventDefault();
		});
	}

	document.getElementById('mobile').classList.remove('hidden');
}

document.body.oncontextmenu = () => false;
