export function create2DArray(rows, cols) {
	return Array.from(new Array(rows), () => new Array(cols));
}
