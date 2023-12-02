import { GenericStore } from '.';

import SettingsStore from './settings';

export interface IOnboardingState {
	dismissed: boolean;
	step: number;
}

const OnboardingStore = new (class Draft extends GenericStore {
	#state: IOnboardingState = {
		dismissed: false,
		step: 0
	};

	constructor() {
		super();

		const state = SettingsStore.getSetting('onboarding');

		if (state) {
			this.#state = state;

			this.emit();
		}
	}

	get dismissed() {
		return this.#state.dismissed;
	}

	get step() {
		return this.#state.step;
	}

	get state() {
		return this.#state;
	}

	setDismissed(dismissed: boolean) {
		this.#state.dismissed = dismissed;

		SettingsStore.setSetting('onboarding', this.#state);

		this.emit();
	}

	setStep(step: number) {
		this.#state.step = step;

		SettingsStore.setSetting('onboarding', this.#state);

		this.emit();
	}
})();

export default OnboardingStore;
