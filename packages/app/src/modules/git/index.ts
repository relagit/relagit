export { ListBranches, Checkout, CreateBranch, DeleteBranch, PushWithOrigin } from './branches';
export { Stash, ListStash, PopStash, RemoveStash } from './stash';
export { Show, ShowOrigin, Details } from './show';
export { Remote, AddRemote } from './remote';
export { CherryPick } from './cherry-pick';
export { Discard } from './discard';
export { Content } from './content';
export { Analyse } from './analyse';
export { Status } from './status';
export { Branch } from './branch';
export { Revert } from './revert';
export { Merge } from './merge';
export { Graph } from './graph';
export { Clone } from './clone';
export { Reset } from './reset';
export { Push } from './push';
export { Diff } from './diff';
export { Init } from './init';
export { Pull } from './pull';
export { Log } from './log';
export { provideSignature } from './signature';

export { type GitParams } from './core';

const nodegit = window.Native.DANGEROUS__NODE__REQUIRE('nodegit');

export { nodegit };

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

export const CbIterator = async <
	T extends Array<unknown>,
	P = unknown,
	K = unknown,
	C = T,
	M = ((...t: T) => C) | undefined
>(
	iterator: (p: P, cb: (...t: T) => void, payload?: K) => Promise<unknown>,
	p: P | null | undefined,
	payload?: K,
	modifier?: M
): Promise<M extends undefined ? T[] : C[]> => {
	if (!p) {
		return [];
	}

	const result: T[][] = [];

	await new Promise((resolve, reject) => {
		iterator(
			p,
			(...t: T) => {
				result.push(typeof modifier === 'function' ? modifier(...t) : t[0]);
			},
			payload
		)
			.then(resolve)
			.catch(reject);
	});

	return result as M extends undefined ? T[] : C[];
};
