import * as workflows from './workflows';
import * as remote from './remote';
import * as files from './files';

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
