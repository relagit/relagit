import LayerStore from '@stores/layer';

import { workflows } from './actions/workflows';

export default () => {
	window.Native.listeners.SETTINGS(() => {
		LayerStore.setVisible('settings', true);
	});
	window.Native.listeners.LOAD_WORKFLOW((_, wf) => {
		workflows.add(wf);
	});
};
