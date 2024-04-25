import thena from 'thena/node';

export const log = (message: string) => {
	console.log(
		`%c${thena.color('[RelaGit]', 'blue')}%c ${thena.color(message, thena.ASCII.reset)}`,
		'color: #7AA2F7;',
		'color: #fff;'
	);
};

export const error = (message: string) => {
	console.error(
		`%${thena.color('[RelaGit]', 'yellow')}%c ${thena.color(message, thena.ASCII.reset)}`,
		'color: #e5c062;',
		'color: #fff;'
	);
};

export const warn = (message: string) => {
	console.warn(
		`%c${thena.color('[RelaGit]', 'red')}%c ${thena.color(message, thena.ASCII.reset)}`,
		'color: #e56269;',
		'color: #fff;'
	);
};
