import { cvs } from "./canvas.js";
import { toggleTileMenu } from "./level.js";

export const editorCursor = {
	x: 0,
	y: 0
};

export const buttonsHeld = new Set();

cvs.addEventListener('mousemove', (e) => {
	const rect = cvs.getBoundingClientRect();
	const x = Math.floor((e.clientX - rect.left) / rect.width * 16);
	const y = Math.floor((e.clientY - rect.top) / rect.height * 16);
	editorCursor.x = x;
	editorCursor.y = y;
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
