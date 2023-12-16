import { error } from '../logger';
import { GithubResponse } from './types';

export * from './types';

export const GitHub = <T extends keyof GithubResponse>(
	path: T
): {
	headers: <R = GithubResponse[T][1]>(
		headers: HeadersInit
	) => {
		get: (...params: GithubResponse[T][0]) => Promise<R>;
	};
	get: (...params: GithubResponse[T][0]) => Promise<GithubResponse[T][1]>;
} => {
	let url = 'https://api.github.com/';

	switch (path) {
		case 'repos/:username/:repo/readme':
			url += 'repos/[username]/[repo]/readme';
			break;
		case 'users/:username/repos':
			url += 'users/[username]/repos';
			break;
		case 'users/:username':
			url += 'users/[username]';
			break;
	}

	let headers: HeadersInit = {
		Accept: 'application/vnd.github.v3+json'
	};

	const get = async (...params: GithubResponse[T][0]) => {
		url = url.replace(/\[([^\]]+)\]/g, (_, key) => params.shift() || key);

		const res = await fetch(url, { headers });

		if (res.status !== 200) throw res.statusText;

		return await (headers['Accept'] === 'application/vnd.github.v3+json'
			? res.json()
			: res.text());
	};

	const headersFn = (newHeaders: HeadersInit) => {
		headers = newHeaders;

		return {
			get
		};
	};

	return {
		headers: headersFn,
		get
	};
};

GitHub('users/:username').get('octocat');
