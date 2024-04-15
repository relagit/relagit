import LayerStore from '@app/stores/layer';
import LocationStore from '@app/stores/location';
import { showRepoModal } from '@app/ui/Modal/RepositoryModal';

const webUtils = window.Native.DANGEROUS__NODE__REQUIRE('electron:webUtils');

let dragState = false;

export const startDrag = (e: DragEvent) => {
	if (dragState) return;

	dragState = true;

	LayerStore.setVisible('drag', true);
	LocationStore.setDragState(e);
};

export const endDrag = (e: DragEvent) => {
	dragState = false;

	LayerStore.setVisible('drag', false);
	LocationStore.setDragState(null);

	if (!e.dataTransfer?.files.length) return;

	showRepoModal('add', webUtils.getPathForFile(e.dataTransfer.files.item(0)!));

	LayerStore.setVisible('drag', false);
	LocationStore.setDragState(null);
};
