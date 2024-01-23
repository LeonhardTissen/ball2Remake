export const invisibleTiles = new Set();

export function clearInvensibleTiles() {
	invisibleTiles.clear();
}

export function addInvisibleTile(x, y) {
	invisibleTiles.add(y * 1000 + x);
}

export function isTileInvisible(x, y) {
	return invisibleTiles.has(y * 1000 + x);
}
