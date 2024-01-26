export function create2DArray(rows, cols, filler) {
	return Array.from(new Array(rows), () => new Array(cols).fill(filler));
}
