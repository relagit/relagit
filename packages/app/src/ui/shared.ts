import { Setter } from 'solid-js';

export type PassthroughRef<T> = T & {
	ref?: Setter<HTMLElement>;
};
