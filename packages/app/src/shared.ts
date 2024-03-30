import { Setter } from 'solid-js';

export type PassthroughRef<T> = T & {
	ref?: Setter<HTMLElement | undefined>;
};

export type RecursivePartial<T> = {
	[P in keyof T]?: T[P] extends (infer U)[] ? RecursivePartial<U>[]
	: T[P] extends object | undefined ? RecursivePartial<T[P]>
	: T[P];
};

export type RecursiveRequired<T> = {
	[P in keyof T]?: T[P] extends (infer U)[] ? RecursiveRequired<U>[]
	: T[P] extends object | undefined ? RecursiveRequired<T[P]>
	: T[P];
};
