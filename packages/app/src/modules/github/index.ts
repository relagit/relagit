export * from './types';
export * from './oauth';
export * from './http';
export * from './shared';

export const repoParams = (repoUrl: string): [string, string] => {
	const [owner, repo] = repoUrl
		.replace(/\.git$/, '')
		.split('/')
		.slice(-2);

	return [owner, repo];
};

export const commitFormatsForProvider = (url: string, sha: string) => {
	if (url.includes('github')) return `/commit/${sha}`;
	if (url.includes('gitlab')) return `/commit/${sha}`;
	if (url.includes('bitbucket')) return `/commits/${sha}`;
};
