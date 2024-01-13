import { Router } from '@solidjs/router';
import { ErrorBoundary, render } from 'solid-js/web';

import { loadWorkflows } from '@modules/actions';
import { loadThemes } from '@modules/actions/themes';
import * as ipc from '~/common/ipc';

import EmptyState from '@ui/Common/EmptyState';

import Main from './app';

loadWorkflows();
loadThemes();

const ipcRenderer = window.Native.DANGEROUS__NODE__REQUIRE('electron:ipcRenderer');

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
		<ErrorBoundary
			fallback={
				<EmptyState
					// NOT using t() here as it may also throw
					detail="Something went wrong while loading the app."
					image={EmptyState.Images.Error}
					hint="Try again or report the issue on GitHub."
					actions={[
						{
							label: 'Reload',
							type: 'brand',
							onClick: () => ipcRenderer.invoke(ipc.RELOAD_CLIENT)
						}
					]}
				/>
			}
		>
			<Router>
				<Main />
			</Router>
		</ErrorBoundary>
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
