import { drawSprite } from "./assets.js";
import { sound } from "./audio.js";
import { ctx } from "./canvas.js";
import { isKeyDown } from "./keyboard.js";
import { levels } from "./levels.js";
import { addTextEntity, drawDigits } from "./text.js";
import { entitySpeed, isEntity, isEntityEnemy, isEntityPlatform, isSolid, nameToId, tileIds } from "./tiles.js";

export let level = null;
export let entities = [];

const tileWidth = 10;
let lastDiamondCollectionTime = 0;
let diamondsLeft = 0;
let diamondScore = 0;
const deathTimerLength = 20;
const launcherSpeed = 7;
const launcherStun = 3;
let deathTimer = 0;
let tick = 0;
let stunTimer = 0;
const boosterVerticalSpeed = 4;
const boosterHorizontalSpeed = 8;
let score = 0;
let editorMode = false;
let currentLevel = null;

const fullJumpVelocity = -5.7;
const smallJumpVelocity = -2;

export function toggleEditorMode() {
	editorMode = !editorMode;
	restartLevel();
}

export function restartLevel() {
	loadLevel(currentLevel);
}

export function loadLevel(levelId) {
	currentLevel = levelId;
	const testLevel = JSON.parse(JSON.stringify(levels[levelId]));
	level = testLevel;

	if (editorMode) return;

	entities = [];
	diamondsLeft = 0;
	score = 0;

	for (let y = 0; y < testLevel.length; y++) {
		for (let x = 0; x < testLevel[y].length; x++) {
			switch (testLevel[y][x]) {
				case nameToId.diamond:
					diamondsLeft++;
					break;
				case nameToId.player:
					entities.push({
						type: 'player',
						x: x * tileWidth + tileWidth / 2,
						y: y * tileWidth + tileWidth / 2,
						xvel: 0,
						yvel: 0,
					});
					break;
				case nameToId.horizontalmovingplatform1:
				case nameToId.horizontalmovingplatform2:
				case nameToId.crab:
				case nameToId.pinkmonster:
					entities.push({
						type: tileIds[testLevel[y][x]],
						x: x * tileWidth + tileWidth / 2,
						y: y * tileWidth + tileWidth / 2,
						left: false,
					});
					break;
				case nameToId.elevator1:
				case nameToId.elevator2:
				case nameToId.bird:
				case nameToId.jellyfish:
				case nameToId.lightning:
					entities.push({
						type: tileIds[testLevel[y][x]],
						x: x * tileWidth + tileWidth / 2,
						y: y * tileWidth + tileWidth / 2,
						down: false,
						yTransferMomentum: 0,
					});
					break;
			}

			if (isEntity(testLevel[y][x])) {
				testLevel[y][x] = 0;
			}
		}
	}
}

export function renderLevel() {
	ctx.clearRect(0, 0, 160, 160);

	for (let y = 0; y < 16; y++) {
		for (let x = 0; x < 16; x++) {
			const spriteName = tileIds[level[y][x]];
			switch (level[y][x]) {
				case nameToId.goal:
					drawSprite(diamondsLeft > 0 ? 'goal' : 'goalunlocked', x * tileWidth, y * tileWidth);
					break;
				case nameToId.air:
					break;
				case nameToId.crab:
				case nameToId.pinkmonster:
				case nameToId.bird:
				case nameToId.jellyfish:
					drawSprite(`${spriteName}1`, x * tileWidth, y * tileWidth);
					break;
				case nameToId.player:
					drawSprite('player', x * tileWidth + 3, y * tileWidth + 3);
					break;
				default:
					drawSprite(spriteName, x * tileWidth, y * tileWidth);
					break;
			}
		}
	}

	if (editorMode) return;

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
						restartLevel();
					}
				} else {
					drawSprite('player', entity.x - 2, entity.y - 2);
				}
				break;
			case 'horizontalmovingplatform1':
			case 'horizontalmovingplatform2':
			case 'elevator1':
			case 'elevator2':
			case 'lightning':
				drawSprite(entity.type, entity.x - 5, entity.y - 5);
				break;
			case 'crab':
			case 'pinkmonster':
			case 'bird':
			case 'jellyfish':
				drawSprite(`${entity.type}${Math.floor(tick * 0.5) % 2 + 1}`, entity.x - 5, entity.y - 5);
				break;
		}
	}

	drawDigits(score, 2, 2, false, true);
}

const horizontalPlayerSpeed = 2;

export function tickLevel() {
	tick ++;

	if (editorMode) return;

	for (const entity of entities) {
		switch (entity.type) {
			case 'player':
				if (deathTimer > 0) break;
				entity.x += entity.xvel;
				entity.y += entity.yvel;
				if (stunTimer > 0) {
					stunTimer --;
				} else {
					entity.xvel *= 0.6;
				}
				entity.yvel *= 0.95;
				entity.yvel += 0.3;

				if (entity.xvel < 0.1 && entity.xvel > -0.1) {
					entity.xvel = 0;
				}

				if (stunTimer === 0) {
					if (isKeyDown('ArrowLeft')) {
						if (entity.xvel > -horizontalPlayerSpeed) {
							entity.xvel = -horizontalPlayerSpeed;
						}
					} else if (isKeyDown('ArrowRight')) {
						if (entity.xvel < horizontalPlayerSpeed) {
							entity.xvel = horizontalPlayerSpeed;
						}
					}
				}

				if (entity.yvel > 0) {
					// Collision detection for floor while falling
					const tileX = Math.floor(entity.x / tileWidth);
					const tileY = Math.floor(entity.y / tileWidth);
					if (isSolid(level[tileY][tileX], true, tileX, tileY)) {
						entity.y = Math.floor((entity.y) / tileWidth) * tileWidth - 2;
	
						// Lower jump if holding space
						entity.yvel = isKeyDown(' ') ? smallJumpVelocity : fullJumpVelocity;
					}
				} else {
					// Collision detection for ceiling while jumping
					const tileX = Math.floor(entity.x / tileWidth);
					const tileY = Math.floor((entity.y - 4) / tileWidth);
					if (isSolid(level[tileY][tileX], true, tileX, tileY)) {
						entity.y = Math.ceil((entity.y - 4) / tileWidth) * tileWidth + 2;
						entity.yvel = 0;
					}
				}

				// Collision detection for walls
				if (entity.xvel > 0) {
					const tileX = Math.floor((entity.x + 2) / tileWidth);
					const tileY = Math.floor(entity.y / tileWidth);
					if (isSolid(level[tileY][tileX], true, tileX, tileY)) {
						entity.xvel = 0;
					}
				} else {
					const tileX = Math.floor((entity.x - 2) / tileWidth);
					const tileY = Math.floor(entity.y / tileWidth);
					if (isSolid(level[tileY][tileX], true, tileX, tileY)) {
						entity.xvel = 0;
					}
				}

				// Collision detection for static tiles
				const playerTileX = Math.floor(entity.x / tileWidth);
				const playerTileY = Math.floor(entity.y / tileWidth);
				switch (level[playerTileY][playerTileX]) {
					case nameToId.diamond:
						level[playerTileY][playerTileX] = 0;

						const now = performance.now();
						if (now - lastDiamondCollectionTime < 500) {
							diamondScore += 10;
						} else {
							diamondScore = 10;
						}
						lastDiamondCollectionTime = now;
						addTextEntity(playerTileX, playerTileY, diamondScore);
						score += diamondScore;

						diamondsLeft--;
						if (diamondsLeft === 0) {
							sound.play('CRII');
						} else {
							sound.play('ITM');
						}
						break;
					case nameToId.spike:
						sound.play('KICK');
						deathTimer = deathTimerLength;
						break;
					case nameToId.launcherright:
						entity.xvel = launcherSpeed;
						entity.yvel = -1;
						entity.x = playerTileX * tileWidth + tileWidth / 2;
						entity.y = playerTileY * tileWidth + tileWidth / 2;
						stunTimer = launcherStun;
						break;
					case nameToId.launcherleft:
						entity.xvel = -launcherSpeed;
						entity.yvel = -1;
						entity.x = playerTileX * tileWidth + tileWidth / 2;
						entity.y = playerTileY * tileWidth + tileWidth / 2;
						stunTimer = launcherStun;
						break;
					case nameToId.goal:
						if (diamondsLeft === 0) {
							sound.play('CLIA');
							deathTimer = deathTimerLength;
						}
						break;
					case nameToId.boosterup:
						entity.yvel = -boosterVerticalSpeed;
						break;
					case nameToId.boosterright:
						entity.xvel = boosterHorizontalSpeed;
						break;
					case nameToId.boosterdown:
						entity.yvel = boosterVerticalSpeed;
						break;
					case nameToId.boosterleft:
						entity.xvel = -boosterHorizontalSpeed;
						break;
				}

				// Collision with other entities
				for (const otherEntity of entities) {
					if (isEntityPlatform(nameToId[otherEntity.type])) {
						if (Math.abs(entity.x - otherEntity.x) < 7 && Math.abs(entity.y - otherEntity.y) < 7) {
							entity.yvel = isKeyDown(' ') ? smallJumpVelocity : fullJumpVelocity + (otherEntity.yTransferMomentum || 0);
						}
					} else if (isEntityEnemy(nameToId[otherEntity.type])) {
						if (Math.abs(entity.x - otherEntity.x) < 5 && Math.abs(entity.y - otherEntity.y) < 5) {
							sound.play('KICK');
							deathTimer = deathTimerLength;
						}
					}
				}

				break;
			case 'horizontalmovingplatform1':
			case 'horizontalmovingplatform2':
			case 'crab':
			case 'pinkmonster':
				const horizontalSpeed = entitySpeed[entity.type];
				entity.x += entity.left ? -horizontalSpeed : horizontalSpeed;
				if (isSolid(level[Math.floor(entity.y / tileWidth)][Math.floor((entity.x + (entity.left ? -5 : 5)) / tileWidth)])) {
					entity.left = !entity.left;
				}

				break;
			case 'elevator1':
			case 'elevator2':
			case 'bird':
			case 'jellyfish':
			case 'lightning':
				const verticalSpeed = entitySpeed[entity.type];
				entity.y += entity.down ? -verticalSpeed : verticalSpeed;
				entity.yTransferMomentum = (entity.down ? -1.5 : 1.5);
				if (isSolid(level[Math.floor((entity.y + (entity.down ? -5 : 5)) / tileWidth)][Math.floor(entity.x / tileWidth)])) {
					entity.down = !entity.down;
				}

				break;
		}
	}
}
