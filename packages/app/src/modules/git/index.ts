export { ListBranches, Checkout, CreateBranch, DeleteBranch, PushWithOrigin } from './branches';
export { Stash, ListStash, PopStash, RemoveStash } from './stash';
export { PreviousCommit } from './previous-commit';
export { SubmoduleStatus } from './submodule';
export { Remote, AddRemote } from './remote';
export { Show, ShowOrigin } from './show';
export { Discard } from './discard';
export { Content } from './content';
export { Analyse } from './analyse';
export { Status } from './status';
export { Commit } from './commit';
export { Branch } from './branch';
export { Revert } from './revert';
export { Graph } from './graph';
export { Clone } from './clone';
export { Blame } from './blame';
export { Reset } from './reset';
export { Push } from './push';
export { Diff } from './diff';
export { Init } from './init';
export { Pull } from './pull';
export { Log } from './log';

export { type GitParams } from './core';

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
