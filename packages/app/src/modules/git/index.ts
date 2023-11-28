export { ListBranches, CheckoutBranch, CreateBranch, PushWithOrigin } from './branches';
export { Stash, ListStash, PopStash } from './stash';
export { PreviousCommit } from './previous-commit';
export { Show, ShowOrigin } from './show';
export { Discard } from './discard';
export { Content } from './content';
export { Analyse } from './analyse';
export { Status } from './status';
export { Commit } from './commit';
export { Remote } from './remote';
export { Branch } from './branch';
export { Clone } from './clone';
export { Blame } from './blame';
export { Push } from './push';
export { Diff } from './diff';
export { Init } from './init';
export { Pull } from './pull';
export { Log } from './log';

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
