import AccountStore from '@app/stores/account';

import { GitLab } from '../gitlab';
import { error, warn } from '../logger';
import { openExternal } from '../shell';

const CLIENT_ID = __GITLAB_CLIENT_ID__;

export const GitLabIcon = (props: { size: number }) => (
	// https://upload.wikimedia.org/wikipedia/commons/3/35/GitLab_icon.svg - slightly modified
	<svg
		xmlns="http://www.w3.org/2000/svg"
		width={props.size}
		height={props.size}
		viewBox="0 0 1000 963.197"
		version="1.1"
	>
		<g id="LOGO" transform="matrix(5.2068817,0,0,5.2068817,-489.30756,-507.76085)">
			<path
				fill="#e24329"
				d="m 282.83,170.73 -0.27,-0.69 -26.14,-68.22 a 6.81,6.81 0 0 0 -2.69,-3.24 7,7 0 0 0 -8,0.43 7,7 0 0 0 -2.32,3.52 l -17.65,54 h -71.47 l -17.65,-54 a 6.86,6.86 0 0 0 -2.32,-3.53 7,7 0 0 0 -8,-0.43 6.87,6.87 0 0 0 -2.69,3.24 L 97.44,170 l -0.26,0.69 a 48.54,48.54 0 0 0 16.1,56.1 l 0.09,0.07 0.24,0.17 39.82,29.82 19.7,14.91 12,9.06 a 8.07,8.07 0 0 0 9.76,0 l 12,-9.06 19.7,-14.91 40.06,-30 0.1,-0.08 a 48.56,48.56 0 0 0 16.08,-56.04 z"
				id="path76"
			/>
			<path
				fill="#fc6d26"
				d="m 282.83,170.73 -0.27,-0.69 a 88.3,88.3 0 0 0 -35.15,15.8 L 190,229.25 c 19.55,14.79 36.57,27.64 36.57,27.64 l 40.06,-30 0.1,-0.08 a 48.56,48.56 0 0 0 16.1,-56.08 z"
				id="path78"
			/>
			<path
				fill="#fca326"
				d="m 153.43,256.89 19.7,14.91 12,9.06 a 8.07,8.07 0 0 0 9.76,0 l 12,-9.06 19.7,-14.91 c 0,0 -17.04,-12.89 -36.59,-27.64 -19.55,14.75 -36.57,27.64 -36.57,27.64 z"
				id="path80"
			/>
			<path
				fill="#fc6d26"
				d="M 132.58,185.84 A 88.19,88.19 0 0 0 97.44,170 l -0.26,0.69 a 48.54,48.54 0 0 0 16.1,56.1 l 0.09,0.07 0.24,0.17 39.82,29.82 c 0,0 17,-12.85 36.57,-27.64 z"
				id="path82"
			/>
		</g>
	</svg>
);

let authFlowInProgress = false;

export type OAuthTokenResponse = {
	access_token: string;
	token_type: string;
	expires_in: number;
	refresh_token: string;
	created_at?: number;
};

export const initialiseGitLabFlow = async () => {
	const state = window.crypto.randomUUID();
	const codeVerifier = window.crypto.randomUUID();

	AccountStore.setKey('gitlab_verifier', codeVerifier);

	const encoder = new TextEncoder();
	const data = encoder.encode(codeVerifier);

	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=/g, '');

	// https://gitlab.com/oauth/authorize?client_id=APP_ID&redirect_uri=REDIRECT_URI&response_type=code&state=STATE&scope=REQUESTED_SCOPES
	const url = `https://gitlab.com/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent('relagit://oauth-captive')}&response_type=code&code_challenge=${codeChallenge}&state=${state}&code_challenge_method=S256&scope=api`;

	authFlowInProgress = true;
	openExternal(url);

	window.Native.listeners.OAUTH(async (_, url) => {
		if (!authFlowInProgress) return;
		const search = new URLSearchParams(url.split('?')[1]);

		const params = {
			code: search.get('code'),
			state: search.get('state')
		};

		if (params.state !== state) {
			error('Invalid OAuth state, exiting');

			return (authFlowInProgress = false);
		}

		const next = `https://gitlab.com/oauth/token?client_id=${CLIENT_ID}&code_verifier=${codeVerifier}&code=${params.code}&grant_type=authorization_code&redirect_uri=${encodeURIComponent('relagit://oauth-captive')}`;

		const response = await fetch(next, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			}
		});

		try {
			const json = (await response.json()) as OAuthTokenResponse;

			AccountStore.setKey('gitlab_access', json.access_token);
			AccountStore.setKey('gitlab_refresh', json.refresh_token);

			try {
				const user = await GitLab('user').get();

				AccountStore.setAccount('gitlab', user);
			} catch (e) {
				warn('Could not update gitlab user', e);
			}
		} catch (e) {
			error(e);
		}

		authFlowInProgress = false;
	});
};
