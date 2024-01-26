import { toggleUploadMenu } from "./api.js";
import { drawSprite } from "./assets.js";
import { toggleEditorMode, toggleTileMenu } from "./editor.js";
import { toggleFastMode } from "./gamemanager.js";
import { deleteLevel, restartLevel } from "./level.js";
import { initLevelMenu, toggleLevelMenu } from "./levelmenu.js";
import { getHighestLevel } from "./localstorage.js";

const buttons = [
	'editor', 'restart', 'levels', 'fast', // Game
	'play', 'tiles', 'upload', 'trash' // Editor
];
const uiElement = document.getElementById('ui');

const editorButtons = ['tiles', 'upload', 'play', 'trash'];

export function initUI() {
	for (const buttonName of buttons) {
		const buttonElement = document.createElement('canvas');
		const ctx = buttonElement.getContext('2d');
		buttonElement.id = 'button' + buttonName;
		buttonElement.classList.add(editorButtons.includes(buttonName) ? 'editorButton' : 'gameButton');

		buttonElement.width = 7;
		buttonElement.height = 7;

		drawSprite(`icon${buttonName}`, 0, 0, ctx);

		uiElement.appendChild(buttonElement);

		buttonElement.addEventListener('click', () => {
			switch (buttonName) {
				case 'editor':
				case 'play':
					toggleEditorMode();
					break;
				case 'restart':
					restartLevel();
					break;
				case 'levels':
					initLevelMenu();
					toggleLevelMenu();
					break;
				case 'tiles':
					toggleTileMenu();
					break;
				case 'upload':
					toggleUploadMenu();
					break;
				case 'trash':
					if (confirm('Are you sure you want to delete this level?')) {
						deleteLevel();
					}
					break;
				case 'fast':
					if (getHighestLevel() >= 30) {
						toggleFastMode();
					} else {
						alert('You need to beat all 30 levels to unlock this feature!');
					}
					break;
			}
		});
	}
	setButtonVisibility(false);
}

export function setButtonVisibility(inEditor) {
	const editorButtons = document.querySelectorAll('.editorButton');
	const gameButtons = document.querySelectorAll('.gameButton');

	if (inEditor) {
		editorButtons.forEach(button => button.classList.remove('hidden'));
		gameButtons.forEach(button => button.classList.add('hidden'));
	} else {
		editorButtons.forEach(button => button.classList.add('hidden'));
		gameButtons.forEach(button => button.classList.remove('hidden'));
	}
}

