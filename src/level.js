import { drawRotatedSprite, drawSprite } from "./assets.js";
import { sound } from "./audio.js";
import { ctx, cvs } from "./canvas.js";
import { editorMode, editorCursor, renderEditor, showTileMenu, toggleTileMenu, setCurrentEditorTile } from "./editor.js";
import { clearInvensibleTiles, isTileInvisible } from "./invisible.js";
import { isKeyDown } from "./keyboard.js";
import { levels } from "./levels.js";
import { buttonsHeld } from "./mouse.js";
import { clearParticles, createExplosionParticles, renderExplosionParticles } from "./particle.js";
import { isTemporaryBlockActive } from "./temporaryblock.js";
import { addTextEntity, drawDigits } from "./text.js";
import { advanceTick, tick } from "./tick.js";
import { entitySpeed, isEntity, isEntityAnimated, isEntityEnemy, isEntityPlatform, isSolid, nameToId, tileIds, tileRotations } from "./tiles.js";
import { tileWidth } from "./tilewidth.js";

export let level = null;
export let entities = [];
let portals = null;

let lastDiamondCollectionTime = 0;
let diamondsLeft = 0;
let diamondScore = 0;

const launcherSpeed = 5;
const launcherStun = 7;
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

const gunCooldown = 8;
let timeouts = [];

const explodingBombNeighbours = [
	[-1, -1],
	[0, -1],
	[1, -1],
	[-1, 0],
	[1, 0],
	[-1, 1],
	[0, 1],
	[1, 1],
];

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
	loadLevel('level3');
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
	portals = {
		horizonal: {},
		vertical: {},
	};
	timeouts.forEach(clearTimeout);
	timeouts = [];
	clearParticles();
	clearInvensibleTiles();

	for (let y = 0; y < testLevel.length; y++) {
		for (let x = 0; x < testLevel[y].length; x++) {
			const tileId = testLevel[y][x];
			const spriteName = tileIds[tileId];
			switch (tileId) {
				case nameToId.diamond:
					diamondsLeft++;
					break;
				case nameToId.portalhorizontal:
					if (!portals.horizonal[y]) {
						portals.horizonal[y] = [x];
					} else {
						portals.horizonal[y].push(x);
					}
					break;
				case nameToId.portalvertical:
					if (!portals.vertical[x]) {
						portals.vertical[x] = [y];
					} else {
						portals.vertical[x].push(y);
					}
					break;
				case nameToId.player:
					entities.push({
						type: spriteName,
						x: x * tileWidth + tileWidth / 2,
						y: y * tileWidth + tileWidth / 2,
						xvel: 0,
						yvel: 0,
						portalFatigue: false,
						gunCooldown: 0,
						earthquakeTokens: 0,
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
						portalFatigue: false,
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
				case nameToId.redmonster:
					entities.push({
						type: spriteName,
						x: x * tileWidth + tileWidth / 2,
						y: y * tileWidth + tileWidth / 2,
						down: true,
						left: true,
					});
					break;
				case nameToId.laser:
				case nameToId.peaplatform:
					entities.push({
						type: spriteName,
						x: x * tileWidth + tileWidth / 2,
						y: y * tileWidth + tileWidth / 2,
					});
					break;
				case nameToId.spinningplatform:
					entities.push({
						type: spriteName,
						x: x * tileWidth + tileWidth / 2,
						y: y * tileWidth + tileWidth / 2,
						originX: x * tileWidth + tileWidth / 2,
						originY: y * tileWidth + tileWidth / 2,
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
			renderTile(tileId, x, y, context, thumbnail);

			if (editorCursor.x === x && editorCursor.y === y && buttonsHeld.has(0)) {
				setCurrentEditorTile(tileId);
				toggleTileMenu();
				buttonsHeld.delete(0);
			}

		});
	} else {
		renderTiles(context, levelRender, thumbnail);
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

function renderTile(tileId, x, y, context, thumbnail) {
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
		case nameToId.invisibleblock:
			if (isTileInvisible(x, y) || editorMode || thumbnail) {
				drawSprite('invisibleblock', x * tileWidth, y * tileWidth, context);
			}
			break;
		case nameToId.temporaryblock:
			if (isTemporaryBlockActive(x, y) || editorMode || thumbnail) {
				drawSprite('temporaryblock', x * tileWidth, y * tileWidth, context);
			}
			break;
		default:
			drawSprite(spriteName, x * tileWidth, y * tileWidth, context);
			break;
	}
}

function renderTiles(context, level, thumbnail = false) {
	for (let y = 0; y < level.length; y++) {
		for (let x = 0; x < level[0].length; x++) {
			renderTile(level[y][x], x, y, context, thumbnail)
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
			case 'plane':
			case 'plane2':
				drawRotatedSprite(entity.type, entity.x - 5, entity.y - 5, tileRotations[entity.direction]);
				break;
			case 'crab':
			case 'pinkmonster':
			case 'bird':
			case 'jellyfish':
			case 'wave':
			case 'redmonster':
			case 'laserfire':
				drawSprite(`${entity.type}${Math.floor(tick * 0.5) % 2 + 1}`, entity.x - 5, entity.y - 5);
				break;
			case 'spring':
				if (entity.springTimer > 0) {
					entity.springTimer--;
				}
				drawSprite(`spring${entity.springTimer > 0 ? 2 : 1}`, entity.x - 5, entity.y - 5);
				break;
			case 'bullet':
				drawSprite('bullet', entity.x - 2, entity.y - 3);
				break;
			case 'explodingbomb':
				drawSprite(`explodingbomb${Math.floor(entity.age)}`, entity.x - 10, entity.y - 10);
				break;
			default:
				drawSprite(entity.type, entity.x - 5, entity.y - 5);
				break;
		}
	}
}

const horizontalPlayerSpeed = 2;

export function tickLevel() {
	advanceTick();

	if (editorMode) return;

	let playerEntity = null;
	for (const entity of entities) {
		switch (entity.type) {
			case 'player':
				if (deathTimer > 0 || winTimer > 0) break;
				entity.x += entity.xvel;
				entity.y += entity.yvel;
				if (stunTimer > 0) {
					stunTimer --;
					entity.yvel = 0;
				} else {
					entity.xvel *= 0.6;
					entity.yvel *= 0.95;
				}
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
				if (entity.gunCooldown > 0) {
					entity.gunCooldown --;
				} 

				// Edge of screen death
				if (entity.x < 0 || entity.y < 0 || entity.x > cvs.width || entity.y > cvs.height) {
					sound.play('KICK');
					deathTimer = deathTimerLength;
					break;
				}

				// Collision for walls while moving fast
				const dampeningLookAhead = 5;
				if (entity.xvel > 3) {
					const tileX = Math.floor((entity.x + dampeningLookAhead) / tileWidth);
					const tileY = Math.floor(entity.y / tileWidth);
					if (isSolid(level[tileY][tileX], true, false, tileX, tileY)) {
						entity.x = Math.floor(entity.x / tileWidth) * tileWidth + 8;
						entity.xvel = 0;
					}
				} else if (entity.xvel < -3) {
					const tileX = Math.floor((entity.x - dampeningLookAhead) / tileWidth);
					const tileY = Math.floor(entity.y / tileWidth);
					if (isSolid(level[tileY][tileX], true, false, tileX, tileY)) {
						entity.x = Math.floor(entity.x / tileWidth) * tileWidth + 2;
						entity.xvel = 0;
					}
				}

				if (entity.yvel > 0) {
					// Collision detection for floor while falling
					const tileX = Math.floor(entity.x / tileWidth);
					const tileY = Math.floor(entity.y / tileWidth);
					if (isSolid(level[tileY][tileX], true, false, tileX, tileY)) {
						entity.y = Math.floor((entity.y) / tileWidth) * tileWidth - 2;
	
						// Lower jump if holding space
						entity.yvel = isKeyDown(' ') ? smallJumpVelocity : fullJumpVelocity;
					}
				} else {
					// Collision detection for ceiling while jumping
					const tileX = Math.floor(entity.x / tileWidth);
					const tileY = Math.floor((entity.y - 4) / tileWidth);
					if (isSolid(level[tileY][tileX], true, false, tileX, tileY)) {
						entity.y = Math.ceil((entity.y - 4) / tileWidth) * tileWidth + 2;
						entity.yvel = 0;
					}
				}

				// Collision detection for walls
				if (entity.xvel > 0) {
					const tileX = Math.floor((entity.x + 2) / tileWidth);
					const tileY = Math.floor(entity.y / tileWidth);
					if (isSolid(level[tileY][tileX], true, false, tileX, tileY)) {
						entity.xvel = 0;
					}
				} else {
					const tileX = Math.floor((entity.x - 2) / tileWidth);
					const tileY = Math.floor(entity.y / tileWidth);
					if (isSolid(level[tileY][tileX], true, false, tileX, tileY)) {
						entity.xvel = 0;
					}
				}

				// Collision detection for static tiles
				const playerTileX = Math.floor(entity.x / tileWidth);
				const playerTileY = Math.floor(entity.y / tileWidth);
				switch (level[playerTileY][playerTileX]) {
					case nameToId.air:
						entity.portalFatigue = false;
						break;
					case nameToId.diamond:
						level[playerTileY][playerTileX] = nameToId.air;

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
						entity.x = playerTileX * tileWidth + tileWidth / 2 + 5;
						entity.y = playerTileY * tileWidth + tileWidth / 2;
						stunTimer = launcherStun;
						break;
					case nameToId.launcherleft:
						entity.xvel = -launcherSpeed;
						entity.yvel = -1;
						entity.x = playerTileX * tileWidth + tileWidth / 2 - 5;
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
					case nameToId.portalhorizontal:
						if (entity.portalFatigue) break;
						const portalX = portals.horizonal[playerTileY].find(x => x !== playerTileX);
						if (portalX) {
							entity.x = portalX * tileWidth + tileWidth / 2;
							entity.y = playerTileY * tileWidth + tileWidth / 2;
							entity.portalFatigue = true;
						}
						break;
					case nameToId.portalvertical:
						if (entity.portalFatigue) break;
						const portalY = portals.vertical[playerTileX].find(y => y !== playerTileY);
						if (portalY) {
							entity.x = playerTileX * tileWidth + tileWidth / 2;
							entity.y = portalY * tileWidth + tileWidth / 2;
							entity.portalFatigue = true;
						}
						break;
					case nameToId.gun:
						if (entity.gunCooldown > 0) break;
						entities.push({
							type: 'bullet',
							x: playerTileX * tileWidth + tileWidth / 2,
							y: playerTileY * tileWidth + tileWidth / 2,
							xvel: -2,
						});
						entities.push({
							type: 'bullet',
							x: playerTileX * tileWidth + tileWidth / 2,
							y: playerTileY * tileWidth + tileWidth / 2,
							xvel: 2,
						});
						entity.gunCooldown = gunCooldown;
						break;
					case nameToId.bomb:
						sound.play('Bom');
						level[playerTileY][playerTileX] = nameToId.air;

						entities.push({
							type: 'explodingbomb',
							x: playerTileX * tileWidth + tileWidth / 2,
							y: playerTileY * tileWidth + tileWidth / 2,
							age: 0,
						});
						break;
					case nameToId.earthquaketoken:
						entity.earthquakeTokens++;
						level[playerTileY][playerTileX] = nameToId.air;

						if (entity.earthquakeTokens === 3) {
							entity.earthquakeTokens ++;
							// Destroy all explodable blocks
							for (let y = 0; y < level.length; y++) {
								for (let x = 0; x < level[y].length; x++) {
									timeouts.push(setTimeout(() => {
										if (editorMode) return;
										if (
											level[y][x] === nameToId.explodableblock ||
											level[y][x] === nameToId.explodableblockbomb ||
											level[y][x] === nameToId.breakableblock
										) {
											if (level[y][x] === nameToId.explodableblockbomb) {
												entities.push({
													type: 'explodingbomb',
													x: x * tileWidth + tileWidth / 2,
													y: y * tileWidth + tileWidth / 2,
													age: 0,
												});
											}
											level[y][x] = nameToId.air;
											sound.play('BRE');
											createExplosionParticles('explodableblock', x * tileWidth, y * tileWidth);
										}
									}, Math.random() * 3000));
								}
							}
						} else {
							sound.play('ITM');
						}
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
				const ballTileX = Math.floor(entity.x / tileWidth);
				const ballTileY = Math.floor(entity.y / tileWidth);
				switch (level[ballTileY][ballTileX]) {
					case nameToId.air:
						entity.portalFatigue = false;
						break;
					case nameToId.portalhorizontal:
						if (entity.portalFatigue) break;
						const portalX = portals.horizonal[ballTileY].find(x => x !== ballTileX);
						if (portalX) {
							entity.x = portalX * tileWidth + tileWidth / 2;
							entity.y = ballTileY * tileWidth + tileWidth / 2;
							entity.portalFatigue = true;
						}
						break;
					case nameToId.portalvertical:
						if (entity.portalFatigue) break;
						const portalY = portals.vertical[ballTileX].find(y => y !== ballTileY);
						if (portalY) {
							entity.x = ballTileX * tileWidth + tileWidth / 2;
							entity.y = portalY * tileWidth + tileWidth / 2;
							entity.portalFatigue = true;
						}
						break;
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
			case 'spinningplatform':
				const spinningSpeed = 0.25;
				entity.x = entity.originX + Math.sin(tick * spinningSpeed) * tileWidth;
				entity.y = entity.originY + Math.cos(tick * spinningSpeed) * tileWidth;
				break;
			case 'crusher':
				// Check if player below
				playerEntity = entities.find(e => e.type === 'player');
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
			case 'redmonster':
				const redMonsterSpeed = 1;
				entity.x += entity.left ? -redMonsterSpeed : redMonsterSpeed;
				entity.y += entity.down ? redMonsterSpeed : -redMonsterSpeed;
				if (entity.down) {
					// Floor collision
					if (isSolid(level[Math.floor((entity.y + 5) / tileWidth)][Math.floor(entity.x / tileWidth)])) {
						entity.down = false;
					}
				} else {
					// Ceiling collision
					if (isSolid(level[Math.floor((entity.y - 5) / tileWidth)][Math.floor(entity.x / tileWidth)])) {
						entity.down = true;
					}
				}
				if (entity.left) {
					// Left wall collision
					if (isSolid(level[Math.floor(entity.y / tileWidth)][Math.floor((entity.x - 5) / tileWidth)])) {
						entity.left = false;
					}
				} else {
					// Right wall collision
					if (isSolid(level[Math.floor(entity.y / tileWidth)][Math.floor((entity.x + 5) / tileWidth)])) {
						entity.left = true;
					}
				}
				break;
			case 'plane':
			case 'plane2':
				const planeSpeed = entity.type === 'plane' ? 1 : 2;
				// Rotate clockwise when hitting a wall
				switch (entity.direction) {
					case 'up':
						entity.y -= planeSpeed;
						if (isSolid(level[Math.floor((entity.y - 5) / tileWidth)][Math.floor(entity.x / tileWidth)])) {
							entity.direction = 'right';
							entity.y = Math.ceil((entity.y - 5) / tileWidth) * tileWidth + 5;
						}
						break;
					case 'right':
						entity.x += planeSpeed;
						if (isSolid(level[Math.floor(entity.y / tileWidth)][Math.floor((entity.x + 5) / tileWidth)])) {
							entity.direction = 'down';
							entity.x = Math.floor((entity.x + 5) / tileWidth) * tileWidth - 5;
						}
						break;
					case 'down':
						entity.y += planeSpeed;
						if (isSolid(level[Math.floor((entity.y + 5) / tileWidth)][Math.floor(entity.x / tileWidth)])) {
							entity.direction = 'left';
							entity.y = Math.floor((entity.y + 5) / tileWidth) * tileWidth - 5;
						}
						break;
					case 'left':
						entity.x -= planeSpeed;
						if (isSolid(level[Math.floor(entity.y / tileWidth)][Math.floor((entity.x - 5) / tileWidth)])) {
							entity.direction = 'up';
							entity.x = Math.ceil((entity.x - 5) / tileWidth) * tileWidth + 5;
						}
						break;
				}
			case 'laser':
				// Check if player is to the right of the laser
				playerEntity = entities.find(e => e.type === 'player');

				if (deathTimer === 0) {
					if (playerEntity.x > entity.x && playerEntity.y > entity.y - 5 && playerEntity.y < entity.y + 5) {
						// Recursively check if laser can reach player (Check for any solid walls in the way)
						const playerTileX = Math.floor(playerEntity.x / tileWidth);
						const laserTileX = Math.floor(entity.x / tileWidth);
						const laserTileY = Math.floor(entity.y / tileWidth);
						let x = laserTileX;
						let y = laserTileY;

						const laserTiles = [];

						let laserCanReachPlayer = false;
						let hitWall = false;
						while (!hitWall) {
							x++;
							if (isSolid(level[y][x])) {
								hitWall = true;
								break;
							}
							laserTiles.push({ x, y });
							if (playerTileX === x) {
								laserCanReachPlayer = true;
							}
						}

						if (laserCanReachPlayer) {
							sound.play('KICK');
							deathTimer = deathTimerLength;
							
							// Spawn entities on the way
							laserTiles.forEach(({ x, y }) => {
								entities.push({
									type: 'laserfire',
									x: x * tileWidth + tileWidth / 2,
									y: y * tileWidth + tileWidth / 2,
								});
							})
						}
					}
				}
				break;
			case 'bullet':
				entity.x += entity.xvel;
				const bulletTileX = Math.floor(entity.x / tileWidth);
				const bulletTileY = Math.floor(entity.y / tileWidth);
				// Kill bullet if collide with solid tile
				if (isSolid(level[bulletTileY][bulletTileX], true, true, bulletTileX, bulletTileY)) {
					entities.splice(entities.indexOf(entity), 1);
				}
				// Kill enemy if collide
				for (const otherEntity of entities) {
					if (isEntityEnemy(nameToId[otherEntity.type])) {
						if (Math.abs(entity.x - otherEntity.x) < 5 && Math.abs(entity.y - otherEntity.y) < 5) {
							sound.play('DIE');
							entities.splice(entities.indexOf(otherEntity), 1);
							entities.splice(entities.indexOf(entity), 1);
							const explosionSprite = isEntityAnimated(nameToId[otherEntity.type]) ? `${otherEntity.type}1` : otherEntity.type;
							createExplosionParticles(explosionSprite, otherEntity.x - 5, otherEntity.y - 5);
						}
					}
				}
				break;
			case 'explodingbomb':
				entity.age+=0.5;
				if (entity.age === 5) {
					// Destruction starts
					sound.play('BRE');

					explodingBombNeighbours.forEach(([x, y]) => {
						const tileX = Math.floor((entity.x + x * tileWidth) / tileWidth);
						const tileY = Math.floor((entity.y + y * tileWidth) / tileWidth);
						if (
							level[tileY][tileX] === nameToId.explodableblock ||
							level[tileY][tileX] === nameToId.explodableblockbomb
						) {
							if (level[tileY][tileX] === nameToId.explodableblockbomb) {
								// Spawn another bomb
								entities.push({
									type: 'explodingbomb',
									x: tileX * tileWidth + tileWidth / 2,
									y: tileY * tileWidth + tileWidth / 2,
									age: 0,
								});
							}
							// Destroy block and cause explosion
							level[tileY][tileX] = nameToId.air;
							createExplosionParticles('explodableblock', tileX * tileWidth, tileY * tileWidth);

						}
					});
				}
				if (entity.age > 8) {
					// Destroy bomb
					entities.splice(entities.indexOf(entity), 1);
				}
				break;
		}
	}
}
