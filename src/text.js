import { drawSprite } from "./assets.js";
import { ctx } from "./canvas.js";

const textEntities = [];


export function addTextEntity(x, y, text) {
	const age = 0;

	textEntities.push({
		x: x * 10 + 5,
		y: y * 10 + 5,
		text,
		age
	});
}

export function drawDigit(digit, x, y) {
	const spriteName = 'number' + digit;
	drawSprite(spriteName, x, y);
}

const shadowPositions = [
	[0, 1],
	[1, 0],
	[0, -1],
	[-1, 0],
	[1, 1],
	[1, -1],
	[-1, 1],
	[-1, -1],
];
export function drawDigits(digits, x, y, centered = false, shadow = false) {
	digits = digits.toString();
	const offset = centered ? Math.floor(digits.length * -2) : 0;
	for (let i = 0; i < digits.length; i++) {
		if (shadow) {
			ctx.filter = 'brightness(0)';
			shadowPositions.forEach(([dx, dy]) => {
				drawDigit(digits[i], x + i * 4 + offset + dx, y + dy);
			});
			ctx.filter = 'brightness(1)';
		}
		drawDigit(digits[i], x + i * 4 + offset, y);
	}
}

export function renderTextEntities() {
	for (let i = 0; i < textEntities.length; i++) {
		const entity = textEntities[i];
		
		entity.age++;
		entity.y -= 0.5;
		drawDigits(entity.text, entity.x, entity.y, true);

		if (entity.age > 20) {
			textEntities.splice(textEntities.indexOf(entity), 1);
			i --;
		}
	}
}
