import { drawSprite } from "./assets.js";
import { sound } from "./audio.js";
import { ctx, cvs } from "./canvas.js";
import { editorMode, editorCursor, renderEditor, showTileMenu, toggleTileMenu, setCurrentEditorTile } from "./editor.js";
import { isKeyDown } from "./keyboard.js";
import { levels } from "./levels.js";
import { buttonsHeld } from "./mouse.js";
import { createExplosionParticles, renderExplosionParticles } from "./particle.js";
import { addTextEntity, drawDigits } from "./text.js";
import { advanceTick, tick } from "./tick.js";
import { entitySpeed, isEntity, isEntityAnimated, isEntityEnemy, isEntityPlatform, isSolid, nameToId, tileIds } from "./tiles.js";
import { tileWidth } from "./tilewidth.js";

export let level = null;
export let entities = [];

let lastDiamondCollectionTime = 0;
let diamondsLeft = 0;
let diamondScore = 0;

const launcherSpeed = 7;
const launcherStun = 3;
let stunTimer = 0;

let deathTimer = 0;
const deathTimerLength = 20;

let winTimer = 0;
const winTimerLength = 30;

const boosterVerticalSpeed = 4;
const boosterHorizontalSpeed = 8;
let score = 0;
export let currentLevel = null;

let starTimer = 0;
const starTimerLength = 150;

const fullJumpVelocity = -5.7;
const smallJumpVelocity = -1.9;
const springVelocity = 8.2;

export function restartLevel() {
	loadLevel(currentLevel);
}

export function goToNextLevel() {
	const levelNum = parseInt(currentLevel.replace('level', ''));
	const nextLevelNum = levelNum + 1;
	const nextLevelId = `level${nextLevelNum}`;
	loadLevel(levels[nextLevelId] ? nextLevelId : '404');
}

export function goToFirstLevel() {
	loadLevel('level1');
}

export function goToLevel(levelId) {
	loadLevel(levelId);
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
			const tileId = testLevel[y][x];
			const spriteName = tileIds[tileId];
			switch (tileId) {
				case nameToId.diamond:
					diamondsLeft++;
					break;
				case nameToId.player:
					entities.push({
						type: spriteName,
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
						type: spriteName,
						x: x * tileWidth + tileWidth / 2,
						y: y * tileWidth + tileWidth / 2,
						left: false,
					});
					break;
				case nameToId.elevator1:
				case nameToId.elevator2:
					entities.push({
						type: spriteName,
						x: x * tileWidth + tileWidth / 2,
						y: y * tileWidth + tileWidth / 2,
						down: false,
						yTransferMomentum: 0,
					});
					break;
				case nameToId.bird:
				case nameToId.jellyfish:
				case nameToId.lightning:
					entities.push({
						type: spriteName,
						x: x * tileWidth + tileWidth / 2,
						y: y * tileWidth + tileWidth / 2,
						down: false,
					});
					break;
				case nameToId.plane:
				case nameToId.plane2:
					entities.push({
						type: spriteName,
						x: x * tileWidth + tileWidth / 2,
						y: y * tileWidth + tileWidth / 2,
						direction: 'up',
					});
					break;
				case nameToId.crusher:
					entities.push({
						type: spriteName,
						x: x * tileWidth + tileWidth / 2,
						y: y * tileWidth + tileWidth / 2,
						behaviour: 'neutral',
					});
					break;
				case nameToId.spring:
					entities.push({
						type: spriteName,
						x: x * tileWidth + tileWidth / 2,
						y: y * tileWidth + tileWidth / 2,
						springTimer: 0,
					});
					break;
				case nameToId.wave:
					entities.push({
						type: spriteName,
						x: x * tileWidth + tileWidth / 2,
						y: y * tileWidth + tileWidth / 2,
						left: false,
						originY: y * tileWidth + tileWidth / 2,
					});
					break;
				case nameToId.rollingball:
					entities.push({
						type: spriteName,
						x: x * tileWidth + tileWidth / 2,
						y: y * tileWidth + tileWidth / 2,
						left: false,
					});
					break;
				case nameToId.wasp:
					entities.push({
						type: spriteName,
						x: x * tileWidth + tileWidth / 2,
						y: y * tileWidth + tileWidth / 2,
						xVel: 3,
						left: true,
					});
					break;
			}

			if (isEntity(testLevel[y][x])) {
				testLevel[y][x] = nameToId.air;
			}
		}
	}
}

export function renderLevel(context, thumbnail = false, levelRender = level) {
	if (thumbnail) {
		ctx.fillStyle = '#000';
		ctx.fillRect(0, 0, cvs.width, cvs.height);
	} else {
		ctx.clearRect(0, 0, cvs.width, cvs.height);
	}

	if (editorMode && showTileMenu && !thumbnail) {
		Object.keys(tileIds).map(x => parseInt(x)).forEach((tileId, i) => {
			const x = i % levelRender.length;
			const y = Math.floor(i / levelRender[0].length);
			renderTile(tileId, x, y);

			if (editorCursor.x === x && editorCursor.y === y && buttonsHeld.has(0)) {
				setCurrentEditorTile(tileId);
				toggleTileMenu();
				buttonsHeld.delete(0);
			}

		});
	} else {
		renderTiles(context, levelRender);
	}

	if (thumbnail) return;

	if (editorMode) {
		renderEditor();

		return;
	};

	renderEntities();
	renderExplosionParticles();

	drawDigits(score, 2, cvs.height - 7, false, true);
}

function renderTile(tileId, x, y, context) {
	const spriteName = tileIds[tileId];
	switch (tileId) {
		case nameToId.goal:
			drawSprite(diamondsLeft > 0 ? 'goal' : 'goalunlocked', x * tileWidth, y * tileWidth, context);
			break;
		case nameToId.air:
			break;
		case nameToId.crab:
		case nameToId.pinkmonster:
		case nameToId.bird:
		case nameToId.jellyfish:
		case nameToId.wave:
		case nameToId.spring:
			drawSprite(`${spriteName}1`, x * tileWidth, y * tileWidth, context);
			break;
		case nameToId.redmonster:
			drawSprite(`${spriteName}2`, x * tileWidth, y * tileWidth, context);
			break;
		case nameToId.player:
			drawSprite('player', x * tileWidth + 3, y * tileWidth + 3, context);
			break;
		default:
			drawSprite(spriteName, x * tileWidth, y * tileWidth, context);
			break;
	}
}

function renderTiles(context, level) {
	for (let y = 0; y < level.length; y++) {
		for (let x = 0; x < level[0].length; x++) {
			renderTile(level[y][x], x, y, context)
		}
	}
}

function renderEntities() {
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
				} else if (winTimer > 0) {
					winTimer -= 0.2;
					drawSprite('player', entity.x - 2, entity.y - 2);
					if (winTimer <= 0) {
						goToNextLevel();
					}
				} else if (starTimer > 10) {
					drawSprite('playerinvincible', entity.x - 2, entity.y - 2);
				} else {
					drawSprite('player', entity.x - 2, entity.y - 2);
				}
				break;
			case 'horizontalmovingplatform1':
			case 'horizontalmovingplatform2':
			case 'elevator1':
			case 'elevator2':
			case 'lightning':
			case 'crusher':
			case 'wasp':
			case 'rollingball':
				drawSprite(entity.type, entity.x - 5, entity.y - 5);
				break;
			case 'crab':
			case 'pinkmonster':
			case 'bird':
			case 'jellyfish':
			case 'wave':
			case 'redmonster':
				drawSprite(`${entity.type}${Math.floor(tick * 0.5) % 2 + 1}`, entity.x - 5, entity.y - 5);
				break;
			case 'spring':
				if (entity.springTimer > 0) {
					entity.springTimer--;
				}
				drawSprite(`spring${entity.springTimer > 0 ? 2 : 1}`, entity.x - 5, entity.y - 5);
				break;
		}
	}
}

const horizontalPlayerSpeed = 2;

export function tickLevel() {
	advanceTick();

	if (editorMode) return;

	for (const entity of entities) {
		switch (entity.type) {
			case 'player':
				if (deathTimer > 0 || winTimer > 0) break;
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

				if (starTimer > 0) {
					starTimer --;
				}

				// Edge of screen death
				if (entity.x < 0 || entity.y < 0 || entity.x > cvs.width || entity.y > cvs.height) {
					sound.play('KICK');
					deathTimer = deathTimerLength;
					break;
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
					case nameToId.star:
						sound.play('CRII');
						starTimer = starTimerLength;
						level[playerTileY][playerTileX] = nameToId.air;
						break;
					case nameToId.spike:
						if (starTimer > 0) {
							// Destroy spike
							sound.play('DIE');
							level[playerTileY][playerTileX] = nameToId.air;
							createExplosionParticles('spike', playerTileX * tileWidth, playerTileY * tileWidth);
						} else {
							// Kill player
							sound.play('KICK');
							deathTimer = deathTimerLength;
						}
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
							winTimer = winTimerLength;
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
						if (starTimer > 0) {
							// Kill enemy
							if (Math.abs(entity.x - otherEntity.x) < 5 && Math.abs(entity.y - otherEntity.y) < 5) {
								sound.play('DIE');
								entities.splice(entities.indexOf(otherEntity), 1);
								const explosionSprite = isEntityAnimated(nameToId[otherEntity.type]) ? `${otherEntity.type}1` : otherEntity.type;
								createExplosionParticles(explosionSprite, otherEntity.x - 5, otherEntity.y - 5);
							}
						} else {
							// Kill player
							if (Math.abs(entity.x - otherEntity.x) < 5 && Math.abs(entity.y - otherEntity.y) < 5) {
								sound.play('KICK');
								deathTimer = deathTimerLength;
							}
						}
					} else if (otherEntity.type === 'spring') {
						if (Math.abs(entity.x - otherEntity.x) < 5 && Math.abs(entity.y - otherEntity.y) < 5) {
							entity.yvel = -springVelocity;
							otherEntity.springTimer = 10;
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
			case 'wave':
				entity.x += entity.left ? -3 : 3;
				entity.y = entity.originY + Math.sin(tick * 0.3) * tileWidth;
				if (isSolid(level[Math.floor(entity.y / tileWidth)][Math.floor((entity.x + (entity.left ? -5 : 5)) / tileWidth)])) {
					entity.left = !entity.left;
				}
				break;
			case 'rollingball':
				// Check if ball can fall
				if (
					!isSolid(level[Math.floor((entity.y + 5) / tileWidth)][Math.floor((entity.x + 4) / tileWidth)]) &&
					!isSolid(level[Math.floor((entity.y + 5) / tileWidth)][Math.floor((entity.x - 4) / tileWidth)])
				) {
					entity.y += 2;
				} else {
					entity.y = Math.floor((entity.y + 5) / tileWidth) * tileWidth - 5;
					
					entity.x += entity.left ? -2 : 2;
					if (isSolid(level[Math.floor(entity.y / tileWidth)][Math.floor((entity.x + (entity.left ? -5 : 5)) / tileWidth)])) {
						entity.left = !entity.left;
					}
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
			case 'crusher':
				// Check if player below
				const playerEntity = entities.find(e => e.type === 'player');
				if (
					playerEntity.x > entity.x - 5 &&
					playerEntity.x < entity.x + 5 &&
					playerEntity.y > entity.y
				) {
					entity.behaviour = 'crushing';
				}

				switch (entity.behaviour) {
					case 'crushing':
						if (isSolid(level[Math.floor((entity.y + 5) / tileWidth)][Math.floor(entity.x / tileWidth)])) {
							entity.behaviour = 'raising';
							entity.y = Math.floor((entity.y + 5) / tileWidth) * tileWidth - 5;
						} else {
							entity.y += 4;
						}
						break;
					case 'raising':
						if (isSolid(level[Math.floor((entity.y - 5) / tileWidth)][Math.floor(entity.x / tileWidth)])) {
							entity.behaviour = 'neutral';
							entity.y = Math.ceil((entity.y - 5) / tileWidth) * tileWidth + 5;
						} else {
							entity.y -= 1;
						}
						break;
				}
				break;
			case 'wasp':
				const waspSpeedChange = 0.5;
				entity.x += entity.xVel;
				entity.xVel += entity.left ? -waspSpeedChange : waspSpeedChange;
				if (entity.xVel > 3) {
					entity.left = true;
				} else if (entity.xVel < -3) {
					entity.left = false;
				}
				break;
		}
	}
}
