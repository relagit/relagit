import { __RELAGIT_PATH__ } from '../../stores/settings';

const path = window.Native.DANGEROUS__NODE__REQUIRE('path');
const fs = window.Native.DANGEROUS__NODE__REQUIRE('fs');

const __SETTINGS_PATH__ = path.join(__RELAGIT_PATH__, 'settings');

if (!fs.existsSync(__SETTINGS_PATH__)) {
	fs.mkdirSync(__SETTINGS_PATH__, { recursive: true });
}

type RecordType = {
	[key: string | symbol]: string | boolean | number | object | undefined;
};

const getAll = (key: string): RecordType => {
	if (fs.existsSync(path.join(__SETTINGS_PATH__, `${key}.json`))) {
		return JSON.parse(
			fs.readFileSync(path.join(__SETTINGS_PATH__, `${key}.json`), 'utf8')
		) as RecordType;
	}

	fs.writeFileSync(path.join(__SETTINGS_PATH__, `${key}.json`), '{}', 'utf8');

	return {};
};

const get = (key: string, prop: string | symbol) => {
	const settings = getAll(key);

	return settings[prop];
};

const set = (
	key: string,
	prop: string | symbol,
	value: string | boolean | number | object | undefined
) => {
	const settings = getAll(key);

	settings[prop] = value;

	fs.writeFileSync(path.join(__SETTINGS_PATH__, `${key}.json`), JSON.stringify(settings), 'utf8');
};

const optionsListeners: Record<string, ((settings: RecordType) => void)[]> = {};

const addOptionsListener = (key: string, cb: (settings: RecordType) => void) => {
	optionsListeners[key] ??= [];
	optionsListeners[key].push(cb);
};

export const getOptionsProxy = (file: string) => {
	const key = file.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();

	const settings = getAll(key);

	return new Proxy(settings, {
		get(_, prop) {
			if (prop === '_listener') {
				return (cb: (settings: RecordType) => void) => addOptionsListener(key, cb);
			}

			return settings[prop] || get(key, prop);
		},
		set(_, prop, value) {
			settings[prop] = value;
			set(key, prop, value);

			if (optionsListeners[key]) {
				optionsListeners[key].forEach((cb) => cb(getAll(key)));
			}

			return true;
		},
		deleteProperty(_, prop) {
			delete settings[prop];
			set(key, prop, undefined);

			if (optionsListeners[key]) {
				optionsListeners[key].forEach((cb) => cb(getAll(key)));
			}

			return true;
		}
	});
};
