import { JSX } from 'solid-js';

export type Element = {
	tagName: keyof JSX.IntrinsicElements;
	attributes: Record<string, string>;
	children:
		| ((Element | string)[] | string | Element)
		| (() => (Element | string)[] | string | Element);
};

export type SettingsPane = {
	name: string;
	icon: keyof typeof import('@primer/octicons');
	children:
		| ((Element | string)[] | string | Element)
		| (() => (Element | string)[] | string | Element);
};

export const USER_PANES: Record<string, SettingsPane> = {};

export const registerSettingsPane = (id: string, props: SettingsPane) => {
	USER_PANES[id] = props;
};
