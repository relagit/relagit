import { BrowserWindowConstructorOptions, nativeTheme } from 'electron';

import { RecursivePartial } from '~/app/src/shared';
import { Settings } from '~/app/src/stores/settings';

import { backgroundFromTheme } from './settings';

export const getMacBrowserWindowOptions = (
	isOnboarding: boolean,
	settings: RecursivePartial<Settings>
): Partial<BrowserWindowConstructorOptions> => {
	if (isOnboarding)
		return {
			vibrancy: 'sidebar',
			backgroundColor: '#00000000'
		};

	return {
		vibrancy: settings?.ui?.vibrancy ? 'sidebar' : undefined
	};
};

export const getWinBrowserWindowOptions = (
	isOnboarding: boolean,
	settings: RecursivePartial<Settings>
): Partial<BrowserWindowConstructorOptions> => {
	if (isOnboarding)
		return {
			backgroundMaterial: 'mica',
			autoHideMenuBar: true
		};

	return {
		backgroundColor:
			settings?.ui?.vibrancy ?
				undefined
			:	backgroundFromTheme(settings?.ui?.theme || '', nativeTheme.shouldUseDarkColors),
		backgroundMaterial: settings?.ui?.vibrancy ? 'mica' : undefined,
		autoHideMenuBar: true
	};
};

export const getDefaultBrowserWindowOptions = (
	_: boolean,
	settings: RecursivePartial<Settings>
): Partial<BrowserWindowConstructorOptions> => {
	return {
		backgroundColor: backgroundFromTheme(
			settings?.ui?.theme || 'system',
			nativeTheme.shouldUseDarkColors
		)
	};
};

export const getPlatformWindowOptions = (
	isOnboarding: boolean,
	settings: RecursivePartial<Settings>
) => {
	switch (process.platform) {
		case 'darwin':
			return getMacBrowserWindowOptions(isOnboarding, settings);
		case 'win32':
			return getWinBrowserWindowOptions(isOnboarding, settings);
		default:
			return getDefaultBrowserWindowOptions(isOnboarding, settings);
	}
};
