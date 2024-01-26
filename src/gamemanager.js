import { restartLevel, tickLevel } from "./level.js";

let gameInterval = null;

export let ticksPerSecond = 30;

export function toggleFastMode() {
	ticksPerSecond = ticksPerSecond === 30 ? 60 : 30;
	startGameLoop();
	restartLevel();
}

export function startGameLoop() {
	clearInterval(gameInterval);
	gameInterval = setInterval(tickLevel, 1000 / ticksPerSecond);
}
