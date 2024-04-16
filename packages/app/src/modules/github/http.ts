import AccountStore from '@app/stores/account';

import { GithubResponse } from './types';

type _HeadersInit = HeadersInit & {
	Accept:
		| 'application/vnd.github.v3+json'
		| 'application/vnd.github.v3.html'
		| 'text/plain'
		| 'text/html';
};

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

type Get<P extends unknown[], R> = (...params: P) => Promise<R>;
type Post<P extends unknown[], R> = (body: unknown, ...params: P) => Promise<R>;
type Stream<P extends unknown[], R> = (...params: P) => AsyncIterable<R & { done: boolean }>;
type Headers<P extends unknown[], R> = (headers: _HeadersInit) => {
	get: Get<P, R>;
	post: Post<P, R>;
	stream: Stream<P, R>;
};

export const GitHub = <T extends keyof GithubResponse>(
	path: T
): {
	headers: Headers<GithubResponse[T][0], GithubResponse[T][1]>;
	get: Get<GithubResponse[T][0], GithubResponse[T][1]>;
	post: Post<GithubResponse[T][0], GithubResponse[T][1]>;
	query: (query: Record<string, string>) => {
		get: Get<GithubResponse[T][0], GithubResponse[T][1]>;
		post: Post<GithubResponse[T][0], GithubResponse[T][1]>;
		headers: Headers<GithubResponse[T][0], GithubResponse[T][1]>;
		stream: Stream<GithubResponse[T][0], GithubResponse[T][1]>;
	};
	stream: Stream<GithubResponse[T][0], GithubResponse[T][1]>;
} => {
	let url = 'https://api.github.com/';

	switch (path) {
		case 'repos/:username/:repo/actions/runs':
			url += 'repos/[username]/[repo]/actions/runs?per_page=100';
			break;
		case 'repos/:username/:repo/readme':
			url += 'repos/[username]/[repo]/readme?';
			break;
		case 'users/:username/repos':
			url += 'users/[username]/repos?per_page=32&sort=updated&type=all';
			break;
		case 'users/:username':
			url += 'users/[username]?';
			break;
		case 'orgs/:org/repos':
			url += 'orgs/[org]/repos?per_page=32&sort=updated&type=all';
			break;
		case 'user/repos':
			url += 'user/repos?per_page=32&sort=updated&type=all';
			break;
		case 'user/orgs':
			url += 'user/orgs?per_page=32';
			break;
		case 'user':
			url += 'user?';
			break;
	}

	let headers: HeadersInit = {
		Accept: 'application/vnd.github.v3+json'
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

	const get = async <R = GithubResponse[T][1]>(...params: GithubResponse[T][0]): Promise<R> => {
		url = url.replace(/\[([^\]]+)\]/g, (_, key) => params.shift() || key);

		const search = new URLSearchParams(url);

		for (const [key, value] of Object.entries(queryParams)) {
			search.set(key, value);
		}

		url = decodeURIComponent(search.toString());

		const res = await fetch(url, {
			headers: {
				Authorization:
					AccountStore.hasKey('github_access') ?
						`Bearer ${await AccountStore.getKey('github_access')}`
					:	'',
				...headers
			}
		});

		if (res.status === 401) {
			throw 'Unauthorized';
		} else if (res.status !== 200) throw res.statusText;

		return (await ((headers as _HeadersInit)['Accept'] === 'application/vnd.github.v3+json' ?
			res.json()
		:	res.text())) as R;
	};

	const post = async <R = GithubResponse[T][1]>(
		body: unknown,
		...params: GithubResponse[T][0]
	) => {
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
					AccountStore.hasKey('github_access') ?
						`Bearer ${await AccountStore.getKey('github_access')}`
					:	'',
				...headers
			},
			body: JSON.stringify(body)
		});

		if (res.status === 401) {
			throw 'Unauthorized';
		} else if (!res.status.toString().startsWith('2')) throw res.statusText;

		return (await ((headers as _HeadersInit)['Accept'] === 'application/vnd.github.v3+json' ?
			res.json()
		:	res.text())) as R;
	};

	async function* stream<R = GithubResponse[T][1]>(
		...params: GithubResponse[T][0]
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
						AccountStore.hasKey('github_access') ?
							`Bearer ${await AccountStore.getKey('github_access')}`
						:	'',
					...headers
				}
			});

			if (res.status === 401) {
				throw 'Unauthorized';
			} else if (res.status !== 200) throw res.statusText;

			const items = (await ((
				(headers as _HeadersInit)['Accept'] === 'application/vnd.github.v3+json'
			) ?
				res.json()
			:	res.text())) as R;

			if (!items || (items as []).length === 0) {
				done = true;
			}

			out.push(...((Array.isArray(items) ? items : []) as R[]));

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
