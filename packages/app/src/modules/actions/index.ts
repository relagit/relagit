import * as files from './files';
import * as remote from './remote';
import * as workflows from './workflows';

export * from './workflows';
export * from './remote';
export * from './files';

if (__NODE_ENV__ === 'development') {
	window.Managers ??= {};

	window.Managers.Core = {
		...workflows,
		...remote,
		...files
	};
}
