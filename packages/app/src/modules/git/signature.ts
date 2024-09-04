import * as ipc from '~/shared/ipc';

import { showInputModal } from '@/ui/Modal/InputModal';

import { Repository } from '../../stores/repository';
import { t } from '../i18n';

const nodegit = window.Native.DANGEROUS__NODE__REQUIRE('nodegit');
const openpgp = window.Native.DANGEROUS__NODE__REQUIRE('openpgp');

const child_process = window.Native.DANGEROUS__NODE__REQUIRE('child_process');
const ipcRenderer = window.Native.DANGEROUS__NODE__REQUIRE('electron:ipcRenderer');

const getPrivateKey = async (committer: string) => {
	if (localStorage.getItem(`__gpg:${committer}`)) {
		return await ipcRenderer.invoke(
			ipc.GET_DECRYPTED,
			localStorage.getItem(`__gpg:${committer}`)
		);
	}

	const key = child_process
		.execSync(`gpg --export-secret-keys -a ${committer}`)
		.toString('ascii');

	if (!key) {
		throw new Error('No public key found.');
	}

	localStorage.setItem(`__gpg:${committer}`, await ipcRenderer.invoke(ipc.GET_ENCRYPTED, key));

	return key;
};

const decryptGpg = async (repository: Repository) => {
	const committer = (await nodegit.Signature.default(repository.git!)).email();

	if (!committer) {
		throw new Error('No committer found.');
	}

	const pubkey = await getPrivateKey(committer);

	const key = await openpgp.readPrivateKey({ armoredKey: pubkey });

	if (!key) {
		throw new Error('No key found.');
	}

	if (localStorage.getItem(`__gpg:${committer}:pass`)) {
		return await openpgp.decryptKey({
			privateKey: key,
			passphrase: await ipcRenderer.invoke(
				ipc.GET_DECRYPTED,
				localStorage.getItem(`__gpg:${committer}:pass`)
			)
		});
	}

	const pass = await showInputModal(t('git.signing.inputPassphrase'), {
		type: 'password'
	});

	if (!pass) {
		throw new Error('No passphrase found.');
	}

	localStorage.setItem(
		`__gpg:${committer}:pass`,
		await ipcRenderer.invoke(ipc.GET_ENCRYPTED, pass)
	);

	return await openpgp.decryptKey({
		privateKey: key,
		passphrase: pass
	});
};

export const provideSignature = async (data: string, repository: Repository) => {
	const publicKeyRes = await decryptGpg(repository);

	if (!publicKeyRes) {
		throw new Error('GPG key decoding error.');
	}

	const buf = new Uint8Array(data.length);
	for (let i = 0; i < data.length; i++) {
		buf[i] = data.charCodeAt(i);
	}

	const signed = await openpgp.sign({
		message: await openpgp.createMessage({
			binary: buf
		}),
		signingKeys: [publicKeyRes],
		detached: true
	});

	return {
		code: nodegit.Error.CODE.OK,
		field: 'gpgsig',
		signedData: signed
	};
};
