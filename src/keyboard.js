import { exportLevel, toggleEditorMode, toggleTileMenu } from "./editor.js";
import { goToFirstLevel, goToNextLevel } from "./level.js";
import { initLevelMenu, toggleLevelMenu } from "./levelmenu.js";

export const keysHeld = new Set();

export function initKeyboard() {
	document.addEventListener('keydown', (e) => {
		keysHeld.add(e.key);

		if (e.key === 'e') {
			toggleEditorMode();
		} else if (e.key === '1') {
			toggleTileMenu();
		} else if (e.key === '2') {
			const exportedLevel = exportLevel();
			console.log(exportedLevel);
		} else if (e.key === '3') {
			initLevelMenu();
			toggleLevelMenu();
		} else if (e.key === 'm') {
			goToNextLevel();
		} else if (e.key === 'n') {
			goToFirstLevel();
		}
	});

	document.addEventListener('keyup', (e) => {
		keysHeld.delete(e.key);
	});
}

export function isKeyDown(key) {
	return keysHeld.has(key);
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
} else {
	document.getElementById('mobile').style.display = 'none';
}

document.body.oncontextmenu = () => false;
