import { cvs } from "./canvas.js";
import { setEditorCursor, toggleTileMenu } from "./editor.js";

export const buttonsHeld = new Set();

cvs.addEventListener('mousemove', (e) => {
	const rect = cvs.getBoundingClientRect();
	const x = Math.floor((e.clientX - rect.left) / rect.width * 16);
	const y = Math.floor((e.clientY - rect.top) / rect.height * 16);
	setEditorCursor(x, y);
});

cvs.addEventListener('mousedown', (e) => {
	buttonsHeld.add(e.button);

	if (e.button === 1) {
		toggleTileMenu();
		e.preventDefault();
	}
});

cvs.addEventListener('mouseup', (e) => {
	buttonsHeld.delete(e.button);
});
