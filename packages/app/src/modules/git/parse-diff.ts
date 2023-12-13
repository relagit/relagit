import parse, { type GitDiff } from 'parse-git-diff';

export { GitDiff };

export const parseDiff = (diff: string): GitDiff => {
	return parse(diff);
};
