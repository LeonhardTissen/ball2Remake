import { drawSprite } from "./assets.js";
import { ctx } from "./canvas.js";
import { currentLevel, restartLevel } from "./level.js";
import { levels } from "./levels.js";
import { buttonsHeld } from "./mouse.js";
import { tick } from "./tick.js";
import { nameToId } from "./tiles.js";
import { tileWidth } from "./tilewidth.js";

export let editorMode = false;
export let showTileMenu = false;
export let currentEditorTile = 1;

export const editorCursor = {
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

	if (buttonsHeld.has(0) || buttonsHeld.has(2)) {
		levels[currentLevel][editorCursor.y][editorCursor.x] = buttonsHeld.has(0) ? currentEditorTile : nameToId.air;
		restartLevel();
	}
}

export function setEditorCursor(x, y) {
	editorCursor.x = x;
	editorCursor.y = y;
}

export function setCurrentEditorTile(tile) {
	currentEditorTile = tile;
}
