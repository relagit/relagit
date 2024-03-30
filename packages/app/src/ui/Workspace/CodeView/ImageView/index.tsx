import { Show, createEffect, createSignal } from 'solid-js';

import { t } from '@app/modules/i18n';
import { error } from '@app/modules/logger';
import { createStoreListener } from '@app/stores';
import LocationStore from '@app/stores/location';
import RepositoryStore from '@app/stores/repository';
import EmptyState from '@app/ui/Common/EmptyState';
import SegmentedControl from '@app/ui/Common/SegmentedControl';
import * as Git from '@modules/git';
import { GitStatus } from '@modules/git/diff';
import * as ipc from '~/common/ipc';

import './index.scss';

const ipcRenderer = window.Native.DANGEROUS__NODE__REQUIRE('electron:ipcRenderer');
const fs = window.Native.DANGEROUS__NODE__REQUIRE('fs');

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

export interface ImageViewProps {
	repository: string;
	path: string;
	fromPath?: string;
	status: GitStatus;
}

const sizeDifference = (size1: number, size2: number): number => {
	return size1 - size2;
};

const nearestByteFigure = (bytes: number): string => {
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

	if (bytes === 0) return '0 Bytes';

	const i = Math.floor(Math.log(bytes) / Math.log(1024));

	return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
};

export default (props: ImageViewProps) => {
	const [threw, setThrew] = createSignal<[string | null, string | null]>([null, null]);
	const [URIs, setURIs] = createSignal<[string | null, string | null]>([null, null]);
	const [size, setSize] = createSignal<[number, number]>([0, 0]);
	const [removedRef, setRemovedRef] = createSignal<HTMLImageElement>();
	const [addedRef, setAddedRef] = createSignal<HTMLImageElement>();
	const [display, setDisplay] = createSignal<'sidebyside' | 'difference'>('sidebyside');

	const historyOpen = createStoreListener([LocationStore], () => LocationStore.historyOpen);
	const commitFile = createStoreListener([LocationStore], () => LocationStore.selectedCommitFile);
	const commit = createStoreListener([LocationStore], () => LocationStore.selectedCommit);

	const repository = createStoreListener([RepositoryStore], () =>
		RepositoryStore.getByPath(props.repository)
	);

	createEffect(async () => {
		const out: [string | null, string | null] = [null, null];
		const threwOut: [string | null, string | null] = [null, null];
		const sizeOut: [number, number] = [0, 0];

		if (props.status && props.status !== 'added') {
			try {
				const remote = await Git.ShowOrigin(
					repository(),
					props.fromPath === '.' ?
						props.path.replace(props.repository, '')
					:	props.fromPath!.replace(props.repository, ''),
					await Git.PreviousCommit(repository(), commit()?.hash), // this will return undefined if there is no commit passed, so we can use it here
					'binary'
				);

				if (remote !== null) {
					const base64 = await ipcRenderer.invoke(ipc.BASE64_FROM_BINARY, remote);

					out[0] = `data:${mimeFromPath(props.fromPath || props.path)};base64,${base64}`;

					sizeOut[0] = remote.length;
				}
			} catch (e) {
				error(e);

				threwOut[0] = (e as Error).message || (e as string);
			}
		}

		if (historyOpen() ? commitFile()!.status !== 'deleted' : fs.existsSync(props.path)) {
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

						sizeOut[1] = remote.length;
					}
				} else {
					const base64 = fs.readFileSync(props.path, 'base64');

					out[1] = `data:${mimeFromPath(props.path)};base64,${base64}`;

					sizeOut[1] = fs.statSync(props.path).size;
				}
			} catch (e) {
				error(e);

				threwOut[1] = (e as Error).message || (e as string);
			}
		}

		setURIs(out);
		setThrew(threwOut);
		setSize(sizeOut);
	});

	return (
		<div classList={{ 'image-view': true, [display()]: true }}>
			<div class="image-view__images">
				<Show
					when={URIs()[0] || URIs()[1]}
					fallback={
						<EmptyState
							image={threw() ? EmptyState.Images.Error : undefined}
							detail={t('codeview.imageview.error')}
							hint={t('codeview.imageview.errorHint')}
						/>
					}
				>
					<Show when={!threw()[0]} fallback={<EmptyState hint={threw()[0] || ''} />}>
						<Show when={URIs()[0]}>
							<div class="image-view__images__image">
								<Show when={display() === 'sidebyside'}>
									<div class="image-view__images__image__type removed">
										Removed
									</div>
								</Show>
								<img
									onLoad={(e) => {
										setRemovedRef(e.currentTarget);
									}}
									class="image-view__images__image__image removed"
									src={URIs()[0] || ''}
								/>
								<Show when={display() === 'sidebyside'}>
									<div class="image-view__images__image__details">
										{removedRef()?.naturalWidth} x {removedRef()?.naturalHeight}
										<div class="image-view__images__image__details__separator" />
										{nearestByteFigure(size()[0])}
									</div>
								</Show>
							</div>
						</Show>
					</Show>
					<Show when={!threw()[1]} fallback={<EmptyState hint={threw()[1] || ''} />}>
						<Show when={URIs()[1]}>
							<div class="image-view__images__image">
								<Show when={display() === 'sidebyside'}>
									<div class="image-view__images__image__type added">Added</div>
								</Show>
								<img
									onLoad={(e) => {
										setAddedRef(e.currentTarget);
									}}
									class="image-view__images__image__image added"
									src={URIs()[1] || ''}
								/>
								<Show when={display() === 'sidebyside'}>
									<div class="image-view__images__image__details">
										{addedRef()?.naturalWidth} x {addedRef()?.naturalHeight}
										<div class="image-view__images__image__details__separator" />
										{nearestByteFigure(size()[1])}
									</div>
								</Show>
							</div>
						</Show>
					</Show>
				</Show>
			</div>
			<Show when={sizeDifference(size()[0], size()[1]) && display() === 'sidebyside'}>
				<div
					classList={{
						'image-view__diff': true,
						removed: sizeDifference(size()[0], size()[1]) > 0,
						added: sizeDifference(size()[0], size()[1]) < 0
					}}
				>
					{sizeDifference(size()[0], size()[1]) < 0 ?
						`+ ${nearestByteFigure(Math.abs(sizeDifference(size()[0], size()[1])))}`
					:	`- ${nearestByteFigure(Math.abs(sizeDifference(size()[0], size()[1])))}`}
				</div>
			</Show>
			<Show when={URIs()[0] && URIs()[1]}>
				<div class="image-view__views">
					<SegmentedControl
						items={[
							{
								label: t('codeview.imageview.sidebyside'),
								value: 'sidebyside'
							},
							{
								label: t('codeview.imageview.difference'),
								value: 'difference'
							}
						]}
						value={display()}
						onChange={setDisplay}
					/>
				</div>
			</Show>
		</div>
	);
};
