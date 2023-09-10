import { GenericStore } from '.';

export interface ILayer {
	key: string;
	visible: boolean;
}
const LayerStore = new (class Layer extends GenericStore {
	#record: ILayer[] = [];
	constructor() {
		super();
	}

	get layers() {
		return this.#record;
	}

	visible(key: string) {
		return this.layers.find((f) => f.key === key)?.visible;
	}

	setVisible(key: string, visible: boolean) {
		this.#record = this.layers.map((f) => {
			if (f.key === key) {
				return {
					...f,
					visible
				};
			}
			return f;
		});
		this.emit();
	}

	addLayer(layer: ILayer) {
		this.layers.push(layer);
		this.emit();
	}

	removeLayer(layer: ILayer) {
		this.#record = this.layers.filter((f) => f.key !== layer.key);
		this.emit();
	}
})();

export default LayerStore;
