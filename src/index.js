import "./assets.js";
import { loadAssets } from "./assets.js";
import "./canvas.js";
import { initKeyboard } from "./keyboard.js";
import { loadLevel, renderLevel, tickLevel } from "./level.js";
import { renderTextEntities } from "./text.js";
import './audio.js';
import './mouse.js';
import { ctx } from "./canvas.js";
import { initUI } from "./ui.js";
import { getHighestLevel } from "./localstorage.js";

const ticksPerSecond = 30;


loadAssets().then(() => {
	initKeyboard();
	initUI();
	const levelToStart = getHighestLevel();
	loadLevel(`level${levelToStart}`);
	loop();
	setInterval(tickLevel, 1000 / ticksPerSecond);
});


function loop() {
	renderLevel(ctx);
	renderTextEntities();

	requestAnimationFrame(loop);
}
