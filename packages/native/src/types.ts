type NodeBuiltIn = 'fs' | 'fs/promises' | 'path' | 'os' | 'child_process';
type ExternalDependency = 'sucrase' | '@wooorm/starry-night';
type ElectronSubModule =
	| keyof typeof import('electron/common')
	| keyof typeof import('electron/renderer');

/**
 * The identifier of a module that can be required.
 */
export type RequireIdentifier = NodeBuiltIn | ExternalDependency | `electron:${ElectronSubModule}`;

/**
 * The result of a `Native.DANGEROUS__NODE__REQUIRE` call.
 */
export type RequireResult<I extends RequireIdentifier> =
	I extends `electron:${infer U}` ?
		U extends keyof typeof import('electron') ?
			(typeof import('electron'))[U]
		:	never
	: I extends 'fs' ? typeof import('fs')
	: I extends 'fs/promises' ? typeof import('fs/promises')
	: I extends 'path' ? typeof import('path')
	: I extends 'os' ? typeof import('os')
	: I extends 'child_process' ? typeof import('child_process')
	: I extends '@wooorm/starry-night' ? typeof import('@wooorm/starry-night')
	: I extends 'sucrase' ? typeof import('sucrase')
	: never;
