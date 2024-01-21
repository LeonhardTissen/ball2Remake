import { drawSprite } from "./assets.js";
import { sound } from "./audio.js";
import { ctx } from "./canvas.js";
import { isKeyDown } from "./keyboard.js";
import { addTextEntity } from "./text.js";
import { isSolid, nameToId, tileIds } from "./tiles.js";
import { create2DArray } from "./utils/array.js";

export let level = null;
export let entities = [];

const tileWidth = 10;
let lastDiamondCollectionTime = 0;
let diamondScore = 0;
const deathTimerLength = 20;
let deathTimer = 0;

export function loadTestLevel() {
	const testLevel = create2DArray(16, 16);
	entities = [];

	for (let i = 0; i < 16; i++) {
		for (let j = 0; j < 16; j++) {
			if (i === 0 || i === 15 || j === 0 || j === 15 || (i % 4 === 0 && j % 3 === 0)) {
				testLevel[i][j] = nameToId.greenbricks;
			} else if (i % 4 === 0 && i !== 2) {
				testLevel[i][j] = nameToId.diamond;
			} else if (i % 4 === 2 && j % 3 === 0 && i !== 2) {
				testLevel[i][j] = nameToId.spike;
			} else {
				testLevel[i][j] = nameToId.air;
			}
		}
	}

	entities.push({
		type: 'player',
		x: 25,
		y: 25,
		xvel: 0,
		yvel: 0,
	});

	level = testLevel;
}

export function renderLevel() {
	ctx.clearRect(0, 0, 160, 160);

	for (let i = 0; i < 16; i++) {
		for (let j = 0; j < 16; j++) {
			if (level[i][j] !== nameToId.air) {
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
						loadTestLevel();
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
					entity.xvel = -horizontalSpeed;
				} else if (isKeyDown('ArrowRight')) {
					entity.xvel = horizontalSpeed;
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
						sound.play('ITM');
						addTextEntity(playerTileX, playerTileY, diamondScore);
						break;
					case nameToId.spike:
						sound.play('KICK');
						deathTimer = deathTimerLength;
						break;
				}


				break;
		}
	}
}
