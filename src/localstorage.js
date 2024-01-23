const storageKey = 'ball2-save'

export function getHighestLevel() {
	return parseInt(localStorage.getItem(storageKey) || '1')
}

export function setNewHighestLevel(level) {
	let highestLevel = getHighestLevel()
	if (level > highestLevel) {
		localStorage.setItem(storageKey, level);
	}
}
