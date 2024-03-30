import AccountStore from '@app/stores/account';

import { Codeberg } from '../codeberg';
import { error, warn } from '../logger';
import { openExternal } from '../shell';
import { OAuthTokenResponse } from './gitlab';

const CLIENT_ID = __CODEBERG_CLIENT_ID__;

export const CodebergIcon = (props: { size: number }) => (
	// https://codeberg.org/Codeberg/Design/raw/branch/main/logo/icon/svg/codeberg-logo_icon_blue.svg - slightly modified
	<svg
		width={props.size}
		height={props.size}
		viewBox="0 0 4.2333332 4.2333335"
		xmlns="http://www.w3.org/2000/svg"
	>
		<defs id="defs1462">
			<linearGradient
				href="#linearGradient6924"
				id="linearGradient6918"
				x1="42519.285"
				y1="-7078.7891"
				x2="42575.336"
				y2="-6966.9307"
				gradientUnits="userSpaceOnUse"
			/>
			<linearGradient id="linearGradient6924">
				<stop style="stop-color:#2185d0;stop-opacity:0" offset="0" id="stop6920" />
				<stop
					id="stop6926"
					offset="0.49517274"
					style="stop-color:#2185d0;stop-opacity:0.48923996"
				/>
				<stop style="stop-color:#2185d0;stop-opacity:0.63279623" offset="1" id="stop6922" />
			</linearGradient>
			<linearGradient
				href="#linearGradient6924-6"
				id="linearGradient6918-3"
				x1="42519.285"
				y1="-7078.7891"
				x2="42575.336"
				y2="-6966.9307"
				gradientUnits="userSpaceOnUse"
			/>
			<linearGradient id="linearGradient6924-6">
				<stop style="stop-color:#2185d0;stop-opacity:0;" offset="0" id="stop6920-7" />
				<stop
					id="stop6926-5"
					offset="0.49517274"
					style="stop-color:#2185d0;stop-opacity:0.30000001;"
				/>
				<stop
					style="stop-color:#2185d0;stop-opacity:0.30000001;"
					offset="1"
					id="stop6922-3"
				/>
			</linearGradient>
		</defs>

		<g id="g370484" transform="matrix(0.06551432,0,0,0.06551432,-2.232417,-1.431776)">
			<path
				id="path6733-5"
				style="font-variation-settings:normal;opacity:1;vector-effect:none;fill:url(#linearGradient6918-3);fill-opacity:1;stroke:none;stroke-width:3.67846;stroke-linecap:butt;stroke-linejoin:miter;stroke-miterlimit:2;stroke-dasharray:none;stroke-dashoffset:0;stroke-opacity:1;paint-order:stroke markers fill;stop-color:#000000;stop-opacity:1"
				d="m 42519.285,-7078.7891 a 0.76086879,0.56791688 0 0 0 -0.738,0.6739 l 33.586,125.8886 a 87.182358,87.182358 0 0 0 39.381,-33.7636 l -71.565,-92.5196 a 0.76086879,0.56791688 0 0 0 -0.664,-0.2793 z"
				transform="matrix(0.37058478,0,0,0.37058478,-15690.065,2662.0533)"
			/>
			<path
				id="path360787"
				style="opacity:1;fill:#2185d0;fill-opacity:1;stroke-width:17.0055;paint-order:markers fill stroke;stop-color:#000000"
				d="m 11249.461,-1883.6961 c -12.74,0 -23.067,10.3275 -23.067,23.0671 0,4.3335 1.22,8.5795 3.522,12.2514 l 19.232,-24.8636 c 0.138,-0.1796 0.486,-0.1796 0.624,0 l 19.233,24.8646 c 2.302,-3.6721 3.523,-7.9185 3.523,-12.2524 0,-12.7396 -10.327,-23.0671 -23.067,-23.0671 z"
				transform="matrix(1.4006354,0,0,1.4006354,-15690.065,2662.0533)"
			/>
		</g>
	</svg>
);

let authFlowInProgress = false;

export const initializeCodebergFlow = async () => {
	const state = window.crypto.randomUUID();
	const codeVerifier = window.crypto.randomUUID();

	AccountStore.setKey('codeberg_verifier', codeVerifier);

	const encoder = new TextEncoder();
	const data = encoder.encode(codeVerifier);

	const hashBuffer = await crypto.subtle.digest('SHA-256', data);
	const codeChallenge = btoa(String.fromCharCode(...new Uint8Array(hashBuffer)))
		.replace(/\+/g, '-')
		.replace(/\//g, '_')
		.replace(/=/g, '');

	// https://[YOUR-GITEA-URL]/login/oauth/authorize?client_id=CLIENT_ID&redirect_uri=REDIRECT_URI&response_type=code&code_challenge_method=CODE_CHALLENGE_METHOD&code_challenge=CODE_CHALLENGE&state=STATE
	const url = `https://codeberg.org/login/oauth/authorize?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent('relagit://oauth-captive')}&response_type=code&code_challenge=${codeChallenge}&state=${state}&code_challenge_method=S256`;

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

		const next = 'https://codeberg.org/login/oauth/access_token';

		const response = await fetch(next, {
			method: 'POST',
			body: JSON.stringify({
				client_id: CLIENT_ID,
				code: params.code,
				grant_type: 'authorization_code',
				redirect_uri: encodeURIComponent('relagit://oauth-captive'),
				code_verifier: codeVerifier
			}),
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json'
			}
		});

		try {
			const json = (await response.json()) as OAuthTokenResponse;

			AccountStore.setKey('codeberg_access', json.access_token);
			AccountStore.setKey('codeberg_refresh', json.refresh_token);

			try {
				const user = await Codeberg('user').get();

				AccountStore.setAccount('codeberg', user);
			} catch (e) {
				warn('Could not update codeberg user', e);
			}
		} catch (e) {
			error(e);
		}

		authFlowInProgress = false;
	});
};
