import { tick } from "./tick.js";

export function isTemporaryBlockActive(x, y) {
	return Math.sin((x + y - tick) / 24) > 0.4;
}
