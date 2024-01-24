import path from 'path';

const timeoutMap = new Map();

const makeConsole = (prefix: string) => {
	return {
		log: (...args: unknown[]) => {
			console.log(`%c[Native:${prefix}]`, 'color: #7AA2F7', ...args);
		},
		info: (...args: unknown[]) => {
			console.log(`%c[Native:${prefix}]`, 'color: #7AA2F7', ...args);
		},
		warn: (...args: unknown[]) => {
			console.log(`%c[Native:${prefix}]`, 'color: #e5c062', ...args);
		},
		error: (...args: unknown[]) => {
			console.log(`%c[Native:${prefix}]`, 'color: #e56269', ...args);
		}
	};
};

const setTimeout = (fn: () => void, delay: number): NodeJS.Timeout => {
	const id = Math.random();

	timeoutMap.set(
		id,
		window.setTimeout(() => {
			fn();
			timeoutMap.delete(id);
		}, delay)
	);

	const obj: NodeJS.Timeout = {
		unref: () => {
			return obj;
		},
		ref: () => {
			return obj;
		},
		hasRef: () => {
			return true;
		},
		refresh: () => {
			return obj;
		},
		[Symbol.toPrimitive]: () => {
			return id;
		},
		[Symbol.dispose]: () => {
			clearTimeout(obj);
		}
	};

	return obj;
};

const clearTimeout = (timeout: NodeJS.Timeout) => {
	if (timeoutMap.has(timeout[Symbol.toPrimitive]() as number)) {
		window.clearTimeout(timeoutMap.get(timeout[Symbol.toPrimitive]() as number)!);
		timeoutMap.delete(timeout[Symbol.toPrimitive]() as number);
	}
};

export default (code: string, filename: string) => {
	try {
		const fn = new Function(
			'console',
			'setTimeout',
			'clearTimeout',
			'module',
			'require',
			'exports',
			code
		);

		return fn(
			makeConsole(path.basename(filename)),
			setTimeout,
			clearTimeout,
			{ exports: {} },
			(path: string) => {
				return require(path);
			},
			{}
		);
	} catch (e) {
		throw e;
	}
};
