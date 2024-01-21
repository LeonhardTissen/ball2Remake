import { level } from "./level.js";

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
	9: 'spinningplatform',
	10: 'boosterup',
	11: 'boosterright',
	12: 'boosterdown',
	13: 'boosterleft',
	14: 'gun',
	15: 'portalvertical',
	16: 'portalhorizontal',
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
	64: 'player',
	65: 'horizontalmovingplatform1',
	66: 'elevator1',
	67: 'crab',
	72: 'horizontalmovingplatform2',
	73: 'elevator2',
	74: 'pinkmonster',
}

export const nameToId = Object.entries(tileIds).reduce((acc, [id, name]) => {
	acc[name] = parseInt(id);
	return acc;
}, {});

export function isSolid(tileId, playerCaused = false, tileX = null, tileY = null) {
	if (playerCaused && tileId === nameToId.breakableblock) {
		level[tileX][tileY] = nameToId.air;
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
	].includes(tileIds[tileId]);
}

export function isEntity(tileId) {
	return [
		'player',
		'horizontalmovingplatform1',
		'horizontalmovingplatform2',
		'elevator1',
		'elevator2',
		'crab',
		'pinkmonster',
	].includes(tileIds[tileId]);
}

export function isEntityPlatform(tileId) {
	return [
		'horizontalmovingplatform1',
		'horizontalmovingplatform2',
		'elevator1',
		'elevator2',
	].includes(tileIds[tileId]);
}

export function isEntityEnemy(tileId) {
	return [
		'crab',
		'pinkmonster',
	].includes(tileIds[tileId]);
}

export const entitySpeed = {
	horizontalmovingplatform1: 1,
	horizontalmovingplatform2: 2,
	crab: 1,
	pinkmonster: 2,
};
