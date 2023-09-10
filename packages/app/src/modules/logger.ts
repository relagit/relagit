export const log = (...message: unknown[]) => {
	console.log(`%c[RelaGit]%c ${message.join(' ')}`, 'color: #7AA2F7;', 'color: #fff;');
};

export const error = (...message: unknown[]) => {
	console.error(`%c[RelaGit] ${message.join(' ')}`, 'color: #e56269;');
};

export const warn = (...message: unknown[]) => {
	console.warn(`%c[RelaGit] ${message.join(' ')}`, 'color: #e5c062;');
};
