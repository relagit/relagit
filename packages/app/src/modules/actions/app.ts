export type Element = {
	tagName: string;
	attributes: Record<string, string>;
	children:
		| ((DElement | string)[] | string | DElement)
		| (() => (DElement | string)[] | string | DElement);
};

export type SettingsPane = {
	name: string;
	icon: keyof typeof import('@primer/octicons');
	children:
		| ((DElement | string)[] | string | DElement)
		| (() => (DElement | string)[] | string | DElement);
};

export const USER_PANES: Record<string, SettingsPane> = {};

export const registerSettingsPane = (id: string, props: SettingsPane) => {
	USER_PANES[id] = props;
};
