import Layer from '..';
import { Show } from 'solid-js';

import { createStoreListener } from '@app/stores';
import LocationStore from '@app/stores/location';

import './index.scss';

export default () => {
	const dragState = createStoreListener([LocationStore], () => LocationStore.dragState);

	return (
		<Layer key="drag" transitions={Layer.Transitions.None} type="bare">
			<Show when={dragState()}>
				<div class="drag-layer">
					<div class="drag-layer__content">
						Drop a repository here add it to your workspace.
					</div>
				</div>
			</Show>
		</Layer>
	);
};
