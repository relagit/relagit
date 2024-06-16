import { Accessor, createEffect, createSignal } from 'solid-js';

export const useLazy = <T extends Promise<unknown>, P extends Accessor<unknown>>(
	param: P,
	lazyFn: (param: ReturnType<P>) => T
): Accessor<Awaited<T> | undefined> => {
	const [value, setValue] = createSignal<Awaited<T> | undefined>(undefined);

	let promise: T | undefined;
	let lastParam: ReturnType<P> | undefined;

	const load = (param: ReturnType<P>) => {
		if (param === lastParam && promise) return;

		lastParam = param;
		promise = lazyFn(param);

		promise.then(setValue);
	};

	createEffect(() => {
		load(param() as ReturnType<P>);
	});

	let loaded = false;

	const accessor = () => {
		if (!loaded) {
			load(param() as ReturnType<P>);
		}

		loaded = true;

		return value();
	};

	return accessor;
};
