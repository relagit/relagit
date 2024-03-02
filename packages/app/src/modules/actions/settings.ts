const path = window.Native.DANGEROUS__NODE__REQUIRE('path');
const os = window.Native.DANGEROUS__NODE__REQUIRE('os');
const fs = window.Native.DANGEROUS__NODE__REQUIRE('fs');

const __SETTINGS_PATH__ = path.join(os.homedir(), '.relagit', 'settings');

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

export const getOptionsProxy = (file: string) => {
	console.log('file', file);
	const key = file.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();

	const settings = getAll(key);

	return new Proxy(settings, {
		get(_, prop) {
			return settings[prop] || get(key, prop);
		},
		set(_, prop, value) {
			settings[prop] = value;
			set(key, prop, value);

			return true;
		},
		deleteProperty(_, prop) {
			delete settings[prop];
			set(key, prop, undefined);

			return true;
		}
	});
};
