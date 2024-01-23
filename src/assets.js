import { ctx } from "./canvas.js";

const assetBaseUrl = '/static/img/';

export let img = null;
export let json = null;

export function loadAssets() {
	return Promise.all([
		loadJson(assetBaseUrl + '0.json'),
		loadImage(assetBaseUrl + '0.png'),
	]);
}

function loadJson(url) {
	return new Promise((resolve, reject) => {
		fetch(url)
			.then(response => response.json())
			.then(data => {
				json = data;
				resolve(data);
			})
			.catch(error => reject(error));
	});
}

function loadImage(url) {
	return new Promise((resolve, reject) => {
		img = new Image();
		img.onload = () => resolve(img);
		img.onerror = () => reject(new Error(`Could not load image at ${url}`));
		img.src = url;
	});
}

export function drawSprite(spriteName, x, y, context = ctx) {
	const sprite = json[spriteName];

	if (!sprite) {
		throw new Error(`No sprite found with name ${spriteName}`);
	}
	
	const rx = Math.floor(x);
	const ry = Math.floor(y);

	context.drawImage(
		img,
		sprite.x,
		sprite.y,
		sprite.w,
		sprite.h,
		rx,
		ry,
		sprite.w,
		sprite.h,
	);
}

export function drawRotatedSprite(spriteName, x, y, rot, context = ctx) {
	const sprite = json[spriteName];

	if (!sprite) {
		throw new Error(`No sprite found with name ${spriteName}`);
	}
	
	const rx = Math.floor(x);
	const ry = Math.floor(y);

	context.save();
	context.translate(rx + sprite.w / 2, ry + sprite.h / 2);
	context.rotate(rot);
	context.drawImage(
		img,
		sprite.x,
		sprite.y,
		sprite.w,
		sprite.h,
		-sprite.w / 2,
		-sprite.h / 2,
		sprite.w,
		sprite.h,
	);
	context.restore();
}
