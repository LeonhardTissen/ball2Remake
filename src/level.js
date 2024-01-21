import { drawSprite } from "./assets.js";
import { sound } from "./audio.js";
import { ctx } from "./canvas.js";
import { isKeyDown } from "./keyboard.js";
import { levels } from "./levels.js";
import { addTextEntity } from "./text.js";
import { isEntity, isSolid, nameToId, tileIds } from "./tiles.js";

export let level = null;
export let entities = [];

const tileWidth = 10;
let lastDiamondCollectionTime = 0;
let diamondsLeft = 0;
let diamondScore = 0;
const deathTimerLength = 20;
let deathTimer = 0;
let currentLevel = 0;

export function loadLevel(levelId) {
	const testLevel = JSON.parse(JSON.stringify(levels[levelId]));
	entities = [];
	diamondsLeft = 0;

	for (let i = 0; i < testLevel.length; i++) {
		for (let j = 0; j < testLevel[i].length; j++) {
			switch (testLevel[i][j]) {
				case nameToId.diamond:
					diamondsLeft++;
					break;
				case nameToId.player:
					entities.push({
						type: 'player',
						x: i * tileWidth + tileWidth / 2,
						y: j * tileWidth + tileWidth / 2,
						xvel: 0,
						yvel: 0,
					});
					break;
			}

			if (isEntity(testLevel[i][j])) {
				testLevel[i][j] = 0;
			}
		}
	}

	level = testLevel;
}

export function renderLevel() {
	ctx.clearRect(0, 0, 160, 160);

	for (let i = 0; i < 16; i++) {
		for (let j = 0; j < 16; j++) {
			if (level[i][j] === nameToId.goal) {
				drawSprite(diamondsLeft > 0 ? 'goal' : 'goalunlocked', i * tileWidth, j * tileWidth);
			} else if (level[i][j] !== nameToId.air) {
				const spriteName = tileIds[level[i][j]];
				drawSprite(spriteName, i * tileWidth, j * tileWidth);
			}
		}
	}

	for (const entity of entities) {
		switch (entity.type) {
			case 'player':
				if (deathTimer > 0) {
					deathTimer -= 0.2;
					const deathAnimFrame = Math.floor(deathTimerLength - deathTimer);
					if (deathAnimFrame <= 3 && deathAnimFrame >= 1) {
						drawSprite(`playerdie${deathAnimFrame}`, entity.x - 5, entity.y - 5);
					}
					if (deathTimer <= 0) {
						loadLevel(currentLevel);
					}
				} else {
					drawSprite('player', entity.x - 2, entity.y - 2);
				}
				break;
		}
	}
}

const horizontalSpeed = 2;

export function tickLevel() {
	for (const entity of entities) {
		switch (entity.type) {
			case 'player':
				if (deathTimer > 0) break;
				entity.x += entity.xvel;
				entity.y += entity.yvel;
				entity.xvel *= 0.6;
				entity.yvel *= 0.95;
				entity.yvel += 0.3;

				if (entity.xvel < 0.1 && entity.xvel > -0.1) {
					entity.xvel = 0;
				}
				if (isKeyDown('ArrowLeft')) {
					if (entity.xvel > -horizontalSpeed) {
						entity.xvel = -horizontalSpeed;
					}
				} else if (isKeyDown('ArrowRight')) {
					if (entity.xvel < horizontalSpeed) {
						entity.xvel = horizontalSpeed;
					}
				}

				// Collision detection for walls
				if (isSolid(entity.xvel > 0 && level[Math.floor((entity.x + 2) / tileWidth)][Math.floor(entity.y / tileWidth)])) {
					entity.xvel = 0;
				}
				if (isSolid(entity.xvel < 0 && level[Math.floor((entity.x - 2) / tileWidth)][Math.floor(entity.y / tileWidth)])) {
					entity.xvel = 0;
				}

				if (entity.yvel > 0) {
					// Collision detection for floor while falling
					if (isSolid(level[Math.floor(entity.x / tileWidth)][Math.floor((entity.y) / tileWidth)])) {
						entity.y = Math.floor((entity.y) / tileWidth) * tileWidth - 2;
	
						// Lower jump if holding space
						if (isKeyDown(' ')) {
							entity.yvel = -2;
						} else {
							entity.yvel = -5.7;
						}
					}
				} else {
					// Collision detection for ceiling while jumping
					if (isSolid(level[Math.floor(entity.x / tileWidth)][Math.floor((entity.y - 4) / tileWidth)])) {
						entity.y = Math.ceil((entity.y - 4) / tileWidth) * tileWidth + 2;
						entity.yvel = 0;
					}
				}

				// Collision detection for diamonds
				const playerTileX = Math.floor(entity.x / tileWidth);
				const playerTileY = Math.floor(entity.y / tileWidth);
				switch (level[playerTileX][playerTileY]) {
					case nameToId.diamond:
						level[playerTileX][playerTileY] = 0;

						const now = performance.now();
						if (now - lastDiamondCollectionTime < 500) {
							diamondScore += 10;
						} else {
							diamondScore = 10;
						}
						lastDiamondCollectionTime = now;
						addTextEntity(playerTileX, playerTileY, diamondScore);
						diamondsLeft--;
						if (diamondsLeft === 0) {
							sound.play('CRII');
						} else {
							sound.play('ITM');
						}
						console.log(diamondsLeft);
						break;
					case nameToId.spike:
						sound.play('KICK');
						deathTimer = deathTimerLength;
						break;
					case nameToId.launcherright:
						entity.xvel = 16;
						entity.yvel = -1;
						entity.x = playerTileX * tileWidth + tileWidth / 2;
						entity.y = playerTileY * tileWidth + tileWidth / 2;
						break;
					case nameToId.launcherleft:
						entity.xvel = -16;
						entity.yvel = -1;
						entity.x = playerTileX * tileWidth + tileWidth / 2;
						entity.y = playerTileY * tileWidth + tileWidth / 2;
						break;
					case nameToId.goal:
						if (diamondsLeft === 0) {
							sound.play('CLIA');
							deathTimer = deathTimerLength;
						}
						break;
				}


				break;
		}
	}
}
