import fs from 'fs/promises';
import path from 'path';

const icons = path.resolve('./node_modules/vscode-material-icons/generated/icons/');
const destination = path.resolve('./public/icons/');

try {
	await fs.cp(icons, destination, { recursive: true });

	console.log('Icons copied successfully!');
} catch (error) {
	console.error('Error copying icons:', error);
}
