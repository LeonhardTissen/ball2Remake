export let keys = 0;

export function addKey() {
	keys++;
}

export function resetKeys() {
	keys = 0;
}

export function hasKey() {
	return keys > 0;
}

export function removeKey() {
	keys--;
}
