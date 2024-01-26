import { exportLevel } from "./editor.js";

export const apiURL = 'https://warze.org/ball2/'

const uploadMenu = document.getElementById('upload');
const uploadButton = document.getElementById('upload-button');
const levelNameField = document.getElementById('level-name');
const levelAuthorField = document.getElementById('author');

export let uploadMenuOpen = false;
export function toggleUploadMenu() {
	uploadMenuOpen = !uploadMenuOpen;
	uploadMenu.classList.toggle('hidden', !uploadMenuOpen);
}

uploadButton.addEventListener('click', () => {
	if (!levelNameField.value) {
		alert('Please enter a level name!');
		return;
	}
	if (!levelAuthorField.value) {
		alert('Please enter an author name!');
		return;
	}
	if (levelNameField.value.length > 10 || !/^[a-z0-9 ]+$/.test(levelNameField.value)) {
		alert('Level name must be 10 characters or less and contain only lowercase letters, numbers, and spaces.');
		return;
	}
	if (levelAuthorField.value.length > 10 || !/^[a-z ]+$/.test(levelAuthorField.value)) {
		alert('Author name must be 10 characters or less and contain only lowercase letters, and spaces.');
		return;
	}

	// Submit form to API
	const form = new FormData();
	form.append('name', levelNameField.value);
	form.append('data', exportLevel());
	form.append('author', levelAuthorField.value);
	fetch(apiURL, {
		method: 'POST',
		body: form
	}).then((response) => {
		if (response.ok) {
			alert('Level uploaded successfully!');
			uploadMenu.classList.add('hidden');
		} else {
			response.text().then((text) => {
				console.log(`Error uploading level: ${text}`);
			});
		}
	});
});
