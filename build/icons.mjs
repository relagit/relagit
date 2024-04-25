import fs from 'fs/promises';
import path from 'path';

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const icons = path.resolve(__dirname, '../node_modules/vscode-material-icons/generated/icons/');

const destination = path.resolve(__dirname, '../public/icons/');
try {
	await fs.cp(icons, destination, { recursive: true });

	console.log('Icons copied successfully!');
} catch (error) {
	console.error('Error copying icons:', error, (await fs.readdir(__dirname)).join(', '));
}
