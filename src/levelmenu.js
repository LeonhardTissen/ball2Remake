import { ctx } from "./canvas.js";
import { generateThumbnail } from "./editor.js";
import { goToLevel, renderLevel } from "./level.js";
import { levels } from "./levels.js";

let levelMenuInitialized = false;

const levelElem = document.getElementById('levels');
export function initLevelMenu() {
	if (levelMenuInitialized) return;

	Object.entries(levels).forEach(([levelName, level]) => {
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
	
		levelElem.appendChild(levelContainer);
	});

	levelMenuInitialized = true;
}

export function toggleLevelMenu() {
	levelElem.classList.toggle('hidden');
}
