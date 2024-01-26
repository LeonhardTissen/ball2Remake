import { apiURL } from "./api.js";
import { ctx } from "./canvas.js";
import { generateThumbnail } from "./editor.js";
import { goToLevel, renderLevel } from "./level.js";
import { levels } from "./levels.js";

let levelMenuInitialized = false;

const levelElem = document.getElementById('levels');
const officialLevelElem = document.getElementById('official');
const onlineLevelElem = document.getElementById('online');
const otherLevelElem = document.getElementById('other');

export function initLevelMenu() {
	if (levelMenuInitialized) return;

	Object.entries(levels).forEach(([levelName, level]) => {
		createLevelButton(levelName, level, levelName.startsWith('level') ? officialLevelElem : otherLevelElem)
	});

	fetch(apiURL).then(response => response.json()).then(data => {
		data.forEach(({ name, data, author }) => {
			levels[name] = JSON.parse(data);
			createLevelButton(name, JSON.parse(data), onlineLevelElem, author);
		});
	});

	levelMenuInitialized = true;
}

function createLevelButton(levelName, level, categoryElem, author = undefined) {
	renderLevel(ctx, true, level);
	const thumbnailData = generateThumbnail();
	const levelContainer = document.createElement('div');
	levelContainer.classList.add('level');

	const levelThumbnail = document.createElement('img');
	levelThumbnail.src = thumbnailData;
	levelContainer.appendChild(levelThumbnail);

	const levelNameElem = document.createElement('h2');
	levelNameElem.innerText = levelName;
	levelContainer.appendChild(levelNameElem);

	if (author) {
		const levelAuthorElem = document.createElement('p');
		levelAuthorElem.innerText = `${author}`;
		levelContainer.appendChild(levelAuthorElem);
	}3

	levelContainer.addEventListener('click', () => {
		goToLevel(levelName);
		toggleLevelMenu();
	});

	categoryElem.appendChild(levelContainer);
}

export function toggleLevelMenu() {
	levelElem.classList.toggle('hidden');
}

export function hideLevelMenu() {
	levelElem.classList.add('hidden');
}
