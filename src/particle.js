import { drawSprite } from "./assets.js";
import { ctx } from "./canvas.js";
import { tileWidth } from "./tilewidth.js";

const explosionParticles = [];

export function createExplosionParticles(assetName, x, y) {
	explosionParticles.push({
		assetName,
		x,
		y,
		age: 0,
	});
}

const particleBuffer = document.createElement('canvas');
particleBuffer.width = tileWidth;
particleBuffer.height = tileWidth;
const pctx = particleBuffer.getContext('2d');
const s = tileWidth / 2;

export function clearParticles() {
	explosionParticles.length = 0;
}

export function renderExplosionParticles() {

	for (const particle of explosionParticles) {
		const { assetName, x, y, age } = particle;
		particle.age++;

		// Clear the particle buffer
		pctx.clearRect(0, 0, tileWidth, tileWidth);

		// Draw the particle to the buffer
		drawSprite(assetName, 0, 0, pctx);

		const f = Math.round((1 - age / 50) * s); // Final size
		const o = age * 0.25; // Offset

		// Draw the four corners of the particle
		ctx.drawImage(particleBuffer, 0, 0, s, s, Math.round(x - o), Math.round(y - o), f, f);
		ctx.drawImage(particleBuffer, 5, 0, s, s, Math.round(x + o) + 5, Math.round(y - o), f, f);
		ctx.drawImage(particleBuffer, 0, 5, s, s, Math.round(x - o), Math.round(y + o) + 5, f, f);
		ctx.drawImage(particleBuffer, 5, 5, s, s, Math.round(x + o) + 5, Math.round(y + o) + 5, f, f);

		if (age > 50) {
			explosionParticles.splice(explosionParticles.indexOf(particle), 1);
		}
	}
}
