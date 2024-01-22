import "./assets.js";
import { loadAssets } from "./assets.js";
import "./canvas.js";
import { initKeyboard } from "./keyboard.js";
import { loadLevel, renderLevel, tickLevel } from "./level.js";
import { renderTextEntities } from "./text.js";
import './audio.js';
import './mouse.js';

const ticksPerSecond = 30;

loadAssets().then(() => {
	initKeyboard();
	loadLevel('level1');
	loop();
	setInterval(tickLevel, 1000 / ticksPerSecond);
});


function loop() {
	renderLevel();
	renderTextEntities();

	requestAnimationFrame(loop);
}
