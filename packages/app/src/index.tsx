import * as Sentry from '@sentry/electron/renderer';
import { ErrorBoundary, render } from 'solid-js/web';
import * as ipc from '~/shared/ipc';

import { loadWorkflows } from '@modules/actions';
import { loadThemes } from '@modules/actions/themes';

import EmptyState from '@ui/Common/EmptyState';

import Main from './app';
import { checkForOTANotifications, checkForUpdates } from './modules/updater';

loadWorkflows();
loadThemes();

checkForUpdates();
setInterval(checkForUpdates, 1000 * 60 * 60);
checkForOTANotifications();

if (__NODE_ENV__ === 'production') Sentry.init({});

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
			fallback={(e) => {
				if (__NODE_ENV__ === 'production')
					Sentry.captureException(new Error('Error rendering main app' + e));

				console.error(e);

				return (
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
				);
			}}
		>
			<Main />
		</ErrorBoundary>
	);
}

const root = document.getElementById('root')!;

render(() => <App />, root);
