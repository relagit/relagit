import { Show, createEffect, createSignal } from 'solid-js';

import { t } from '@app/modules/i18n';
import { error } from '@app/modules/logger';
import { createStoreListener } from '@app/stores';
import LocationStore from '@app/stores/location';
import RepositoryStore from '@app/stores/repository';
import EmptyState, { EMPTY_STATE_IMAGES } from '@app/ui/Common/EmptyState';
import * as Git from '@modules/git';
import { GitStatus } from '@modules/git/diff';
import * as ipc from '~/common/ipc';

import './index.scss';

const ipcRenderer = window.Native.DANGEROUS__NODE__REQUIRE(
	'electron:ipcRenderer'
) as typeof import('electron').ipcRenderer;
const fs = window.Native.DANGEROUS__NODE__REQUIRE('fs') as typeof import('fs');

const mimeFromPath = (path: string) => {
	const ext = path.split('.').pop();

	switch (ext) {
		case 'jpg':
		case 'jpeg':
			return 'image/jpeg';
		case 'png':
			return 'image/png';
		case 'gif':
			return 'image/gif';
		case 'svg':
			return 'image/svg+xml';
		default:
			return 'image/png';
	}
};

export interface IImageViewProps {
	repository: string;
	path: string;
	status: GitStatus;
}

const ps = (str1: string, str2: string): number => {
	const lengthDiff = str1.length - str2.length;
	const percentageDiff = (lengthDiff / Math.max(str1.length, str2.length)) * 100;

	return Math.round(percentageDiff * -1);
};

const kb = (str: string) => str.length / 1008 / 1.5;

export default (props: IImageViewProps) => {
	const [threw, setThrew] = createSignal<[string | null, string | null]>([null, null]);
	const [URIs, setURIs] = createSignal<[string | null, string | null]>([null, null]);

	const historyOpen = createStoreListener([LocationStore], () => LocationStore.historyOpen);
	const commitFile = createStoreListener([LocationStore], () => LocationStore.selectedCommitFile);
	const commit = createStoreListener([LocationStore], () => LocationStore.selectedCommit);

	const repository = createStoreListener([RepositoryStore], () =>
		RepositoryStore.getByPath(props.repository)
	);

	createEffect(async () => {
		const out: [string | null, string | null] = [null, null];
		const threwOut: [string | null, string | null] = [null, null];

		if (props.status && props.status !== 'added') {
			try {
				const remote = await Git.ShowOrigin(
					repository(),
					props.path.replace(props.repository, ''),
					await Git.PreviousCommit(repository(), commit()?.hash), // this will return undefined if there is no commit passed, so we can use it here
					'binary'
				);

				if (remote !== null) {
					const base64 = await ipcRenderer.invoke(ipc.BASE64_FROM_BINARY, remote);

					out[0] = `data:${mimeFromPath(props.path)};base64,${base64}`;
				}
			} catch (e) {
				error(e);

				threwOut[0] = e['message'] || e;
			}
		}

		if (historyOpen() ? commitFile().status !== 'deleted' : fs.existsSync(props.path)) {
			try {
				if (historyOpen()) {
					const remote = await Git.ShowOrigin(
						repository(),
						props.path.replace(props.repository, ''),
						commit()?.hash,
						'binary'
					);

					if (remote !== null) {
						const base64 = await ipcRenderer.invoke(ipc.BASE64_FROM_BINARY, remote);

						out[1] = `data:${mimeFromPath(props.path)};base64,${base64}`;
					}
				} else {
					const binary = fs.readFileSync(props.path, 'binary');

					if (kb(binary) > 700) {
						throw 'File is too large to display';
					}

					const base64 = btoa(binary);

					out[1] = `data:${mimeFromPath(props.path)};base64,${base64}`;
				}
			} catch (e) {
				error(e);

				threwOut[1] = e['message'] || e;
			}
		}

		setURIs(out);
		setThrew(threwOut);
	});

	return (
		<div class="image-view">
			<div class="image-view__images">
				<Show
					when={URIs()[0] || URIs()[1]}
					fallback={
						<EmptyState
							image={{
								light: threw ? EMPTY_STATE_IMAGES.L_ERROR : undefined,
								dark: threw ? EMPTY_STATE_IMAGES.D_ERROR : undefined
							}}
							detail={t('codeview.imageview.error')}
							hint={t('codeview.imageview.errorHint')}
						/>
					}
				>
					<Show when={!threw()[0]} fallback={<EmptyState hint={threw()[0]} />}>
						<Show when={URIs()[0]}>
							<div class="image-view__images__image">
								<div class="image-view__images__image__type removed">Removed</div>
								<img
									class="image-view__images__image__image removed"
									src={URIs()[0]}
								/>
							</div>
						</Show>
					</Show>
					<Show when={!threw()[1]} fallback={<EmptyState hint={threw()[1]} />}>
						<Show when={URIs()[1]}>
							<div class="image-view__images__image">
								<div class="image-view__images__image__type added">Added</div>
								<img
									class="image-view__images__image__image added"
									src={URIs()[1]}
								/>
							</div>
						</Show>
					</Show>
				</Show>
			</div>
			<Show when={!isNaN(ps(URIs()[0] || '', URIs()[1] || ''))}>
				<div
					classList={{
						'image-view__diff': true,
						removed: ps(URIs()[0] || '', URIs()[1] || '') < 0,
						added: ps(URIs()[0] || '', URIs()[1] || '') > 0
					}}
				>
					{ps(URIs()[0] || '', URIs()[1] || '') > 0
						? `+ ${ps(URIs()[0] || '', URIs()[1] || '')}%`
						: `- ${Math.abs(ps(URIs()[0] || '', URIs()[1] || ''))}%`}
				</div>
			</Show>
		</div>
	);
};
