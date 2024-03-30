import AccountStore from '@app/stores/account';

import { GitHub } from './http';

const CLIENT_ID = __GITHUB_CLIENT_ID__;

export interface OAuthInitResponse {
	device_code: string;
	user_code: string;
	verification_uri: string;
	expires_in: number;
	interval: number;
}

export interface OAuthAccessTokenResponse {
	error?:
		| 'slow_down'
		| 'authorization_pending'
		| 'expired_token'
		| 'incorrect_client_credentials'
		| 'incorrect_device_code'
		| 'access_denied'
		| 'unsupported_grant_type';
	access_token?: string;
	token_type?: string;
	expires_in?: number;
	scope?: string;
}

export const SECONDS = 1000;

export const initialiseGitHubFlow = async (): Promise<OAuthInitResponse> => {
	const state = window.crypto.randomUUID();

	const url = `https://github.com/login/device/code?client_id=${CLIENT_ID}&state=${state}&scope=repo&redirect_uri=${encodeURIComponent('relagit://oauth-captive')}`;

	const init = (await fetch(url, {
		method: 'POST',
		headers: {
			Accept: 'application/json'
		}
	}).then((res) => res.json())) as OAuthInitResponse;

	return init;
};

export const pollForToken = (init: OAuthInitResponse): Promise<OAuthAccessTokenResponse> => {
	let done = false;
	let result: OAuthAccessTokenResponse;

	return new Promise((resolve, reject) => {
		const interval = setInterval(
			async () => {
				try {
					if (done) {
						clearInterval(interval);
						return;
					}

					const res = await fetch(
						`https://github.com/login/oauth/access_token?client_id=${CLIENT_ID}&device_code=${init.device_code}&grant_type=urn:ietf:params:oauth:grant-type:device_code&redirect_uri=${encodeURIComponent('relagit://oauth-captive')}`,
						{
							method: 'POST',
							headers: {
								Accept: 'application/json'
							}
						}
					);

					if (res.status !== 200) return;

					const tokenResponse = (await res.json()) as OAuthAccessTokenResponse;

					if (tokenResponse.error === 'authorization_pending') return;

					if (tokenResponse.error === 'slow_down') {
						init.interval += 5;
						return;
					}

					if (
						tokenResponse.error === 'expired_token' ||
						tokenResponse.error === 'access_denied'
					) {
						resolve(tokenResponse);
					}

					if (tokenResponse.error) {
						throw new Error(tokenResponse.error);
					}

					done = true;
					result = tokenResponse;

					clearInterval(interval);

					try {
						await AccountStore.setKey('github_access', result.access_token || '');

						const user = await GitHub('user').get();

						AccountStore.setAccount('github', user);
					} catch (e) {
						console.error(e);
					}

					resolve(result);
				} catch (e) {
					reject(e);
				}
			},
			init.interval * 2 * SECONDS
		);
	});
};
