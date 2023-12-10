import { Setter } from 'solid-js';

export type PassthroughRef<T> = T & {
	ref?: Setter<HTMLElement>;
};

export type RecursivePartial<T> = {
	[P in keyof T]?: T[P] extends (infer U)[]
		? RecursivePartial<U>[]
		: T[P] extends object | undefined
		  ? RecursivePartial<T[P]>
		  : T[P];
};
