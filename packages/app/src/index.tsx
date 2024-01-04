import { Router } from '@solidjs/router';
import { render } from 'solid-js/web';

import { loadWorkflows } from '@modules/actions';
import { loadThemes } from '@modules/actions/themes';

import Main from './app';

loadWorkflows();
loadThemes();

function App() {
	console.log(
		`%cWARNING%c
%cDo not paste any code into this console.%c

This is DevTools, it is meant for developers only.

DO NOT paste any code into this console that you have not written yourself or that you do not understand. This could result in your device being compromised, or your appplication being broken.`,
		'font-size: 72px; font-weight: bold; font-family: SF Mono; color: #e13b3b;',
		'font-size: 12px; font-weight: 400;',
		'font-weight: 600; color: #fff;',
		'font-weight: 400;'
	);

	return (
		<Router>
			<Main />
		</Router>
	);
}

const root = document.getElementById('root')!;

if (__NODE_ENV__ === 'development') {
	import('@solid-devtools/overlay').then((devtools) => {
		devtools.attachDevtoolsOverlay();

		render(() => <App />, root);
	});
} else {
	render(() => <App />, root);
}
