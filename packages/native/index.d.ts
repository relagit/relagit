declare global {
	export const __NODE_ENV__: 'development' | 'production' | 'test';
	export const __COMMIT_HASH__: string;
}

export {};
