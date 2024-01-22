import { drawSprite } from "./assets.js";
import { ctx } from "./canvas.js";
import { restartLevel } from "./level.js";
import { levels } from "./levels.js";
import { tick } from "./tick.js";
import { tileWidth } from "./tilewidth.js";

export let editorMode = false;
export let showTileMenu = false;
export let currentEditorTile = 1;

const editorCursor = {
	x: 0,
	y: 0
};

export function toggleEditorMode() {
	editorMode = !editorMode;
	restartLevel();
}

export function toggleTileMenu() {
	showTileMenu = !showTileMenu;
}

export function renderEditor() {
	ctx.globalAlpha = Math.sin(tick * 0.25) * 0.3 + 0.7;
	drawSprite('cursor', editorCursor.x * tileWidth, editorCursor.y * tileWidth);
	ctx.globalAlpha = 1;

	if (buttonsHeld.has(0)) {
		levels[currentLevel][editorCursor.y][editorCursor.x] = currentEditorTile;
		restartLevel();
	} else if (buttonsHeld.has(2)) {
		levels[currentLevel][editorCursor.y][editorCursor.x] = 0;
		restartLevel();
	}
}

export function setEditorCursor(x, y) {
	editorCursor.x = x;
	editorCursor.y = y;
}
