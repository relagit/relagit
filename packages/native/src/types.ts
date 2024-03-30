export type RequireResult<I> = I extends 'fs'
	? typeof import('fs')
	: I extends 'fs/promises'
		? typeof import('fs/promises')
		: I extends 'electron'
			? typeof import('electron')
			: I extends 'path'
				? typeof import('path')
				: I extends 'os'
					? typeof import('os')
					: I extends 'child_process'
						? typeof import('child_process')
						: I extends 'electron:ipcRenderer'
							? (typeof import('electron'))['ipcRenderer']
							: I extends 'electron:shell'
								? (typeof import('electron'))['shell']
								: I extends 'electron:clipboard'
									? (typeof import('electron'))['clipboard']
									: I extends 'sucrase'
										? typeof import('sucrase')
										: I extends '@wooorm/starry-night'
											? typeof import('@wooorm/starry-night')
											: unknown;
