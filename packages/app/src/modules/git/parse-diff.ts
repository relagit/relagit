import parse, { type GitDiff } from 'parse-git-diff';

export { GitDiff };

export const parseDiff = (diff: string | boolean): GitDiff => {
	if (typeof diff === 'boolean') {
		return {
			files: [],
			type: 'GitDiff'
		};
	}

	return parse(diff);
};
