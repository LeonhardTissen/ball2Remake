import { cvs } from "./canvas.js";
import { editorMode, setEditorCursor, toggleTileMenu } from "./editor.js";
import { level } from "./level.js";

export const buttonsHeld = new Set();

cvs.addEventListener('mousemove', (e) => {
	const rect = cvs.getBoundingClientRect();
	const x = Math.floor((e.clientX - rect.left) / rect.width * level[0].length);
	const y = Math.floor((e.clientY - rect.top) / rect.height * level.length);
	setEditorCursor(x, y);
});

cvs.addEventListener('mousedown', (e) => {
	buttonsHeld.add(e.button);

	if (e.button === 1 && editorMode) {
		toggleTileMenu();
		e.preventDefault();
	}
});

cvs.addEventListener('mouseup', (e) => {
	buttonsHeld.delete(e.button);
});
