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
	21: 'greenbricks',
	64: 'player',
}

export const nameToId = Object.entries(tileIds).reduce((acc, [id, name]) => {
	acc[name] = parseInt(id);
	return acc;
}, {});

export function isSolid(tileId) {
	return [
		'greenbricks',
	].includes(tileIds[tileId]);
}

export function isEntity(tileId) {
	return [
		'player',
	].includes(tileIds[tileId]);
}
