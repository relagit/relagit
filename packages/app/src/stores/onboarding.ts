import { GenericStore } from '.';

import SettingsStore from './settings';

export interface OnboardingState {
	dismissed: boolean;
	step: number;
}

const OnboardingStore = new (class OnboardingStore extends GenericStore {
	#state: Partial<OnboardingState> = {
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

		SettingsStore.setSetting('onboarding.dismissed', dismissed);

		this.emit();
	}

	setStep(step: number) {
		this.#state.step = step;

		SettingsStore.setSetting('onboarding.step', step);

		this.emit();
	}
})();

export default OnboardingStore;
