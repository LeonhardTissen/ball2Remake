import { sound } from "./audio.js";
import { addInvisibleTile } from "./invisible.js";
import { hasKey, removeKey } from "./keys.js";
import { entities, level } from "./level.js";
import { createExplosionParticles } from "./particle.js";
import { isTemporaryBlockActive } from "./temporaryblock.js";
import { tileWidth } from "./tilewidth.js";

export const tileIds = {
	0: 'air',
	1: 'diamond',
	2: 'goal',
	3: 'spike',
	4: 'spring',
	5: 'launcherright',
	6: 'launcherleft',
	7: 'star',
	8: 'bomb',
	9: 'peaplatform',
	10: 'boosterup',
	11: 'boosterright',
	12: 'boosterdown',
	13: 'boosterleft',
	14: 'gun',
	15: 'portalvertical',
	16: 'portalhorizontal',
	17: 'earthquaketoken',
	18: 'key',
	19: 'keyblock',
	20: 'grayblock',
	21: 'greenbricks',
	22: 'explodableblock',
	23: 'explodableblockbomb',
	24: 'breakableblock',
	25: 'invisibleblock',
	26: 'brownbricks',
	27: 'yellowholeblock',
	28: 'purplediamondblock',
	29: 'ballchainblock',
	30: 'purplepillar',
	31: 'leafblock',
	32: 'bluechainblock',
	33: 'cakeblock',
	34: 'wireblock',
	35: 'pinkblock',
	36: 'greenchainblock',
	37: 'blueblock',
	38: 'yellowchainblock',
	39: 'pinkchainblock',
	40: 'yellowbridgeblock',
	41: 'peablock',
	42: 'purpleblock',
	43: 'greenblock',
	44: 'castleblock',
	45: 'castlepillar',
	46: 'statueleft',
	47: 'statueright',
	48: 'orangeblock',
	49: 'limeblock',
	50: 'redbricks',
	51: 'redblock',
	52: 'bubbleblock',
	53: 'bluebricks',
	54: 'darkpeablock',
	55: 'graychainblock',
	56: 'metalblock',
	57: 'brownblock',
	58: 'mushroomblock',
	59: 'waterblock',
	60: 'purplechainblock',
	64: 'player',
	65: 'horizontalmovingplatform1',
	66: 'elevator1',
	67: 'crab',
	68: 'bird',
	69: 'redmonster',
	70: 'wave',
	71: 'spinningplatform',
	72: 'horizontalmovingplatform2',
	73: 'elevator2',
	74: 'pinkmonster',
	75: 'jellyfish',
	76: 'crusher',
	77: 'plane',
	78: 'wasp',
	79: 'rollingball',
	80: 'temporaryblock',
	81: 'laser',
	82: 'plane2',
	83: 'lightning',
	84: 'sun',
	85: 'eye',
	86: 'sensor',
	87: 'jumper',
}

export const nameToId = Object.entries(tileIds).reduce((acc, [id, name]) => {
	acc[name] = parseInt(id);
	return acc;
}, {});

export function isSolid(tileId, playerCaused = false, bulletPower = false, tileX = null, tileY = null) {
	if (playerCaused) {
		if (tileId === nameToId.breakableblock) {
			level[tileY][tileX] = nameToId.air;
			createExplosionParticles('breakableblock', tileX * tileWidth, tileY * tileWidth);
			sound.play('TI');
		} else if (tileId === nameToId.invisibleblock) {
			addInvisibleTile(tileX, tileY);
		}
	}
	if (tileId === nameToId.temporaryblock) {
		return isTemporaryBlockActive(tileX, tileY);
	}
	if (bulletPower) {
		if (tileId === nameToId.explodableblock || tileId === nameToId.explodableblockbomb) {
			if (tileId === nameToId.explodableblockbomb) {
				// Spawn bomb
				entities.push({
					type: 'explodingbomb',
					x: tileX * tileWidth + tileWidth / 2,
					y: tileY * tileWidth + tileWidth / 2,
					age: 0,
				});
			}
			level[tileY][tileX] = nameToId.air;
			createExplosionParticles('explodableblock', tileX * tileWidth, tileY * tileWidth);
			sound.play('BRE');
		}
	}
	if (tileId === nameToId.keyblock) {
		if (hasKey()) {
			removeKey();
			level[tileY][tileX] = nameToId.air;
			sound.play('TI');
			return false;
		}
		return true;
	}
	return [
		'grayblock',
		'greenbricks',
		'explodableblock',
		'explodableblockbomb',
		'breakableblock',
		'invisibleblock',
		'brownbricks',
		'yellowholeblock',
		'purplediamondblock',
		'ballchainblock',
		'purplepillar',
		'leafblock',
		'bluechainblock',
		'cakeblock',
		'wireblock',
		'pinkblock',
		'greenchainblock',
		'blueblock',
		'yellowchainblock',
		'pinkchainblock',
		'yellowbridgeblock',
		'peablock',
		'purpleblock',
		'greenblock',
		'castleblock',
		'castlepillar',
		'statueleft',
		'statueright',
		'orangeblock',
		'limeblock',
		'redbricks',
		'redblock',
		'bubbleblock',
		'bluebricks',
		'darkpeablock',
		'graychainblock',
		'metalblock',
		'brownblock',
		'mushroomblock',
		'waterblock',
		'purplechainblock',
	].includes(tileIds[tileId]);
}

export function isEntity(tileId) {
	return [
		'player',
		'spring',
		'horizontalmovingplatform1',
		'horizontalmovingplatform2',
		'elevator1',
		'elevator2',
		'crab',
		'pinkmonster',
		'bird',
		'jellyfish',
		'lightning',
		'wasp',
		'plane',
		'plane2',
		'redmonster',
		'wave',
		'crusher',
		'rollingball',
		'laser',
		'spinningplatform',
		'peaplatform',
		'sun',
		'eye',
		'sensor',
		'jumper',
	].includes(tileIds[tileId]);
}

export function isEntityPlatform(tileId) {
	return [
		'horizontalmovingplatform1',
		'horizontalmovingplatform2',
		'elevator1',
		'elevator2',
		'spinningplatform',
		'peaplatform',
		'eye',
	].includes(tileIds[tileId]);
}

export function isEntityEnemy(tileId) {
	return [
		'crab',
		'pinkmonster',
		'bird',
		'jellyfish',
		'lightning',
		'wasp',
		'rollingball',
		'plane',
		'plane2',
		'redmonster',
		'wave',
		'crusher',
		'sun',
		'jumper',
	].includes(tileIds[tileId]);
}

export function isEntityAnimated(tileId) {
	return [
		'crab',
		'pinkmonster',
		'bird',
		'jellyfish',
		'redmonster',
		'wave',
		'spring'
	].includes(tileIds[tileId]);
}

export const entitySpeed = {
	horizontalmovingplatform1: 1,
	horizontalmovingplatform2: 2,
	crab: 1,
	pinkmonster: 2,
	bird: 1,
	jellyfish: 2,
	lightning: 4,
	elevator1: 1,
	elevator2: 2,
};

export const tileRotations = {
	'up': 0,
	'right': Math.PI / 2,
	'down': Math.PI,
	'left': -Math.PI / 2,
};
