import AccountStore from '@app/stores/account';

import { GitLabResponse } from './types';

const CLIENT_ID = __GITLAB_CLIENT_ID__;

export const regenerateGitLabToken = async () => {
	const next = `https://gitlab.com/oauth/token?client_id=${CLIENT_ID}&code_verifier=${await AccountStore.getKey('gitlab_verifier')}&refresh_token=${await AccountStore.getKey('gitlab_refresh')}&grant_type=refresh_token&redirect_uri=${encodeURIComponent('relagit://oauth-captive')}`;

	const response = await fetch(next, {
		method: 'POST'
	});

	if (!response.ok) {
		try {
			console.error(await response.text());
		} catch (e) {
			console.error(e);
		}
	}

	const res = (await response.json()) as { access_token: string; refresh_token: string };

	if (!res.access_token || !res.refresh_token) {
		return;
	}

	await Promise.allSettled([
		AccountStore.setKey('gitlab_access', res.access_token),
		AccountStore.setKey('gitlab_refresh', res.refresh_token)
	]);
};

type _HeadersInit = HeadersInit & {
	Accept: 'application/json' | 'application/html' | 'text/plain' | 'text/html';
};

type Get<P extends unknown[], R> = (...params: P) => Promise<R>;
type Post<P extends unknown[], R> = (body: unknown, ...params: P) => Promise<R>;
type Stream<P extends unknown[], R> = (...params: P) => AsyncIterable<R & { done: boolean }>;
type Headers<P extends unknown[], R> = (headers: _HeadersInit) => {
	get: Get<P, R>;
	post: Post<P, R>;
	stream: Stream<P, R>;
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

let triedRegenerating = false;

export const GitLab = <T extends keyof GitLabResponse>(
	path: T
): {
	headers: Headers<GitLabResponse[T][0], GitLabResponse[T][1]>;
	get: Get<GitLabResponse[T][0], GitLabResponse[T][1]>;
	post: Post<GitLabResponse[T][0], GitLabResponse[T][1]>;
	query: (query: Record<string, string>) => {
		get: Get<GitLabResponse[T][0], GitLabResponse[T][1]>;
		post: Post<GitLabResponse[T][0], GitLabResponse[T][1]>;
		headers: Headers<GitLabResponse[T][0], GitLabResponse[T][1]>;
		stream: Stream<GitLabResponse[T][0], GitLabResponse[T][1]>;
	};
	stream: Stream<GitLabResponse[T][0], GitLabResponse[T][1]>;
} => {
	let url = 'https://gitlab.com/api/v4/';
	triedRegenerating = false;

	switch (path) {
		case 'users/:userid/projects':
			url += 'users/[userid]/projects?';
			break;
		case 'user':
			url += 'user?';
			break;
	}

	let headers: HeadersInit = {
		Accept: 'application/json'
	};

	let queryParams: Record<string, string> = {};

	const query = (queries: Record<string, string>) => {
		queryParams = queries;

		return {
			get,
			post,
			headers: headersFn,
			stream
		};
	};

	const get = async <R = GitLabResponse[T][1]>(...params: GitLabResponse[T][0]): Promise<R> => {
		url = url.replace(/\[([^\]]+)\]/g, (_, key) => params.shift() || key);

		const search = new URLSearchParams(url);

		for (const [key, value] of Object.entries(queryParams)) {
			search.set(key, value);
		}

		url = decodeURIComponent(search.toString());

		const res = await fetch(url, {
			headers: {
				Authorization:
					AccountStore.hasKey('gitlab_access') ?
						`Bearer ${await AccountStore.getKey('gitlab_access')}`
					:	'',
				...headers
			}
		});

		if (res.status === 401 && !triedRegenerating) {
			triedRegenerating = true;

			await regenerateGitLabToken();

			return get(...params);
		} else if (res.status !== 200) throw res.statusText;

		return (await ((headers as _HeadersInit)['Accept'] === 'application/json' ?
			res.json()
		:	res.text())) as R;
	};

	const post = async <R = GitLabResponse[T][1]>(
		body: unknown,
		...params: GitLabResponse[T][0]
	): Promise<R> => {
		url = url.replace(/\[([^\]]+)\]/g, (_, key) => params.shift() || key);

		const search = new URLSearchParams(url);

		for (const [key, value] of Object.entries(queryParams)) {
			search.set(key, value);
		}

		url = decodeURIComponent(search.toString());

		const res = await fetch(url, {
			method: 'POST',
			headers: {
				Authorization:
					AccountStore.hasKey('gitlab_access') ?
						`Bearer ${await AccountStore.getKey('gitlab_access')}`
					:	'',
				...headers
			},
			body: JSON.stringify(body)
		});

		if (res.status === 401 && !triedRegenerating) {
			triedRegenerating = true;

			await regenerateGitLabToken();

			return post(body, ...params);
		} else if (!res.status.toString().startsWith('2')) throw res.statusText;

		return (await ((headers as _HeadersInit)['Accept'] === 'application/json' ?
			res.json()
		:	res.text())) as R;
	};

	async function* stream<R = GitLabResponse[T][1]>(
		...params: GitLabResponse[T][0]
	): AsyncIterable<R> {
		let i = 1;
		let done = false;

		const out: unknown[] = [];

		Object.defineProperty(out as R, 'done', {
			get() {
				return done;
			}
		});

		url = url.replace(/\[([^\]]+)\]/g, (_, key) => params.shift() || key);

		while (!done && i < 100) {
			const search = new URLSearchParams(url);

			for (const [key, value] of Object.entries(queryParams)) {
				search.set(key, value);
			}

			search.set('page', i.toString());

			const res = await fetch(decodeURIComponent(search.toString()), {
				headers: {
					Authorization:
						AccountStore.hasKey('gitlab_access') ?
							`Bearer ${await AccountStore.getKey('gitlab_access')}`
						:	'',
					...headers
				}
			});

			if (res.status === 401 && !triedRegenerating) {
				triedRegenerating = true;

				await regenerateGitLabToken();

				return stream(...params);
			} else if (res.status !== 200) throw res.statusText;

			const items = (await ((headers as _HeadersInit)['Accept'] === 'application/json' ?
				res.json()
			:	res.text())) as R;

			if (!items || (items as []).length === 0) {
				done = true;
			}

			out.push(...(Array.isArray(items) ? items : []));

			yield out as R;

			i++;

			await sleep(1);
		}

		return out as R;
	}

	const headersFn = (newHeaders: HeadersInit) => {
		headers = newHeaders;

		return {
			get,
			post,
			query,
			stream
		};
	};

	return {
		headers: headersFn,
		get,
		post,
		query,
		stream
	};
};
