import { GithubResponse } from './types';

export * from './types';

type _HeadersInit = HeadersInit & {
	Accept:
		| 'application/vnd.github.v3+json'
		| 'application/vnd.github.v3.html'
		| 'text/plain'
		| 'text/html';
};

export const GitHub = <T extends keyof GithubResponse>(
	path: T
): {
	headers: <R = GithubResponse[T][1]>(
		headers: _HeadersInit
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

	const get = async <R = GithubResponse[T][1]>(...params: GithubResponse[T][0]): Promise<R> => {
		url = url.replace(/\[([^\]]+)\]/g, (_, key) => params.shift() || key);

		const res = await fetch(url, { headers });

		if (res.status !== 200) throw res.statusText;

		return (await ((headers as _HeadersInit)['Accept'] === 'application/vnd.github.v3+json'
			? res.json()
			: res.text())) as R;
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
