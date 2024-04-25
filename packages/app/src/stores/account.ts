import { GenericStore } from '.';
import * as ipc from '~/shared/ipc';

import type { NormalProviderAccount, Provider, ProviderAccount } from './shared';

export type { Provider, ProviderAccount, NormalProviderAccount };

const ipcRenderer = window.Native.DANGEROUS__NODE__REQUIRE('electron:ipcRenderer');

const AccountStore = new (class AccountStore extends GenericStore {
	constructor() {
		super();
	}

	#last: Provider | null = null;

	get last() {
		return this.#last;
	}

	hasKey(key: `${Provider}_${string}`) {
		return localStorage.getItem('__account__' + key) !== null;
	}

	async setKey(key: `${Provider}_${string}`, value: string) {
		try {
			const encrypted = await ipcRenderer.invoke(ipc.GET_ENCRYPTED, value);

			localStorage.setItem('__account__' + key, encrypted);
		} catch (e) {
			console.error(e);
		}

		this.emit();
	}

	async getKey(key: `${Provider}_${string}`): Promise<string | null> {
		const encrypted = localStorage.getItem('__account__' + key);

		if (!encrypted) return null;
		try {
			return await ipcRenderer.invoke(ipc.GET_DECRYPTED, encrypted);
		} catch (e) {
			console.error(e);

			return null;
		}
	}

	setAccount<T extends Provider>(provider: T, account: ProviderAccount<T>) {
		localStorage.setItem('__account__' + provider, JSON.stringify(account));

		this.emit();
	}

	getAccountFor<T extends Provider>(provider: T | null): ProviderAccount<T> | null {
		if (!provider) return null;

		const account = localStorage.getItem('__account__' + provider);

		if (!account) return null;

		this.#last = provider;

		return JSON.parse(account) as ProviderAccount<T>;
	}

	getNormalisedAccount<T extends Provider>(provider: T | null): NormalProviderAccount<T> | null {
		if (!provider) return null;

		const account = this.getAccountFor(provider);

		if (!account) return null;

		this.#last = provider;

		const out: NormalProviderAccount<T> = {
			provider,
			avatar: '',
			bio: '',
			email: '',
			username: '',
			displayName: ''
		};

		if (provider === 'gitlab') {
			const gitlabAccount = account as ProviderAccount<'gitlab'>;

			out.avatar = gitlabAccount.avatar_url;
			out.bio = gitlabAccount.bio;
			out.email = gitlabAccount.email;
			out.username = gitlabAccount.username;
			out.displayName = gitlabAccount.name;
		}

		if (provider === 'github') {
			const githubAccount = account as ProviderAccount<'github'>;

			out.avatar = githubAccount.avatar_url;
			out.bio = githubAccount.bio;
			out.email = githubAccount.email;
			out.username = githubAccount.login;
			out.displayName = githubAccount.name;
		}

		if (provider === 'codeberg') {
			const codebergAccount = account as ProviderAccount<'codeberg'>;

			out.avatar = codebergAccount.avatar_url;
			out.bio = codebergAccount.description;
			out.email = codebergAccount.email;
			out.username = codebergAccount.login;
			out.displayName = codebergAccount.full_name;
		}

		return out;
	}

	keysFor(provider: Provider): ('access' | 'account' | 'refresh')[] {
		const keys: ('access' | 'account' | 'refresh')[] = [];

		if (this.getAccountFor(provider)) keys.push('account');
		if (this.hasKey(`${provider}_access`)) keys.push('access');
		if (this.hasKey(`${provider}_refresh`)) keys.push('refresh');

		return keys;
	}

	removeAccount(provider: Provider) {
		if (this.getAccountFor(provider)) {
			localStorage.removeItem('__account__' + provider);
		}

		if (this.hasKey(`${provider}_access`)) {
			localStorage.removeItem('__account__' + provider + '_access');
		}

		if (this.hasKey(`${provider}_refresh`)) {
			localStorage.removeItem('__account__' + provider + '_refresh');
		}

		this.emit();
	}
})();

export default AccountStore;
