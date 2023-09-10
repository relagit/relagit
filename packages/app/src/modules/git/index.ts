export { Content } from './content';
export { Analyse } from './analyse';
export { Commit } from './commit';
export { Remote } from './remote';
export { Status } from './status';
export { Branch } from './branch';
export { Push } from './push';
export { Diff } from './diff';
export { Init } from './init';

export { IGitParams as GitParams } from './core';

export const statusFrom = (shorthand: string) => {
	switch (shorthand) {
		case 'M':
			return 'modified';
		case 'R':
			return 'renamed';
		case 'C':
			return 'copied';
		case 'U':
			return 'unmerged';
		case 'T':
			return 'type-changed';
		case 'A':
		case '??':
			return 'added';
		case 'D':
			return 'deleted';
		default:
			return 'unknown';
	}
};
