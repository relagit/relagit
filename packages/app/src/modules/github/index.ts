export * from './types';
export * from './oauth';
export * from './http';

export const repoParams = (repoUrl: string): [string, string] => {
	const [owner, repo] = repoUrl
		.replace(/\.git$/, '')
		.split('/')
		.slice(-2);

	return [owner, repo];
};

export const commitFormatsForProvider = (url: string, sha: string) => {
	const hostname = new URL(url).hostname;

	if (hostname.includes('github')) return `/commit/${sha}`;
	if (hostname.includes('gitlab')) return `/commit/${sha}`;
	if (hostname.includes('codeberg')) return `/commits/${sha}`;
};

export const branchFormatsForProvider = (url: string, branch: string) => {
	const hostname = new URL(url).hostname;

	if (hostname.includes('github')) return `/tree/${branch}`;
	if (hostname.includes('gitlab')) return `/tree/${branch}`;
	if (hostname.includes('codeberg')) return `/src/branch/${branch}`;
};

export const getProvider = (url: string) => {
	const hostname = new URL(url).hostname;

	if (hostname.includes('github')) return 'github';
	if (hostname.includes('gitlab')) return 'gitlab';
	if (hostname.includes('codeberg')) return 'codeberg';
};

export const issuesUrlForProvider = (url: string, repo: [string, string]) => {
	const hostname = new URL(url).hostname;

	if (hostname.includes('github')) return `https://github.com/${repo[0]}/${repo[1]}/issues`;
	if (hostname.includes('gitlab')) return `https://gitlab.com/${repo[0]}/${repo[1]}/issues`;
	if (hostname.includes('codeberg')) return `https://codeberg.org/${repo[0]}/${repo[1]}/issues`;
};

export const pullRequestsUrlForProvider = (url: string, repo: [string, string]) => {
	const hostname = new URL(url).hostname;

	if (hostname.includes('github')) return `https://github.com/${repo[0]}/${repo[1]}/pulls`;
	if (hostname.includes('gitlab'))
		return `https://gitlab.com/${repo[0]}/${repo[1]}/merge_requests`;
	if (hostname.includes('codeberg')) return `https://codeberg.org/${repo[0]}/${repo[1]}/pulls`;
};
