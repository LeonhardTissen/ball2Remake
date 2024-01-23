import { apiURL } from "./api.js";
import { ctx } from "./canvas.js";
import { generateThumbnail } from "./editor.js";
import { goToLevel, renderLevel } from "./level.js";
import { levels } from "./levels.js";

let levelMenuInitialized = false;

const levelElem = document.getElementById('levels');
const officialLevelElem = document.getElementById('official');
const onlineLevelElem = document.getElementById('online');

export function initLevelMenu() {
	if (levelMenuInitialized) return;

	Object.entries(levels).forEach(([levelName, level]) => {
		createLevelButton(levelName, level, officialLevelElem)
	});

	fetch(apiURL).then(response => response.json()).then(data => {
		data.forEach(({ name, data }) => {
			createLevelButton(name, JSON.parse(data), onlineLevelElem);
		});
	});

	levelMenuInitialized = true;
}

function createLevelButton(levelName, level, categoryElem) {
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

	levelContainer.addEventListener('click', () => {
		goToLevel(levelName);
		toggleLevelMenu();
	});

	categoryElem.appendChild(levelContainer);
}

export function toggleLevelMenu() {
	levelElem.classList.toggle('hidden');
}
