import { Show, createEffect } from 'solid-js';

import { createStoreListener } from '@stores/index';
import { ILogCommit } from '@app/modules/git/log';
import { showErrorModal } from '@app/ui/Modal';
import { debug, error } from '@modules/logger';
import { renderDate } from '@app/modules/time';
import LocationStore from '@stores/location';
import { t } from '@app/modules/i18n';
import * as Git from '@modules/git';

import './index.scss';

export default (props: ILogCommit) => {
	const selected = createStoreListener([LocationStore], () => LocationStore.selectedCommit);

	createEffect(() => {
		console.log('selected', selected()?.hash);
		console.log('props', props.hash);

		console.log('selected === props', selected()?.hash === props.hash);
	});

	return (
		<div
			aria-role="button"
			aria-label={t('sidebar.commit.label', {
				hash: props.message
			})}
			aria-selected={selected()?.hash === props.hash}
			class={`sidebar__commit ${selected()?.hash === props.hash ? 'active' : ''}`}
			data-id={props.hash}
			data-active={selected()?.hash === props.hash}
			onClick={async () => {
				LocationStore.setSelectedCommit(props);

				try {
					LocationStore.setSelectedCommitFiles(
						await Git.Show(LocationStore.selectedRepository.path, props.hash)
					);
				} catch (e) {
					showErrorModal(e, 'error.git');

					error('Failed to show commit', e);
				}
			}}
			onKeyDown={async (e) => {
				if (e.key === 'Enter') {
					debug('Transitioning to commit', props.hash);
					LocationStore.setSelectedCommit(props);

					try {
						LocationStore.setSelectedCommitFiles(
							await Git.Show(LocationStore.selectedRepository.path, props.hash)
						);
					} catch (e) {
						showErrorModal(e, 'error.git');

						error('Failed to show commit', e);
					}
				}
			}}
			tabIndex={0}
		>
			<div class="sidebar__commit__top">
				<div class="sidebar__commit__top__message">{props.message}</div>
				<div class="sidebar__commit__top__hash">{props.hash.substring(0, 7)}</div>
			</div>
			<div class="sidebar__commit__bottom">
				<div class="sidebar__commit__bottom__author">{props.author}</div>
				<div class="sidebar__commit__bottom__date">
					{renderDate(new Date(props.date).getTime())()}
				</div>
				<div class="sidebar__commit__bottom__diff">
					<Show when={props.insertions}>
						<div class="sidebar__commit__bottom__diff__insertions">
							+{props.insertions}
						</div>
					</Show>
					<Show when={props.deletions}>
						<div class="sidebar__commit__bottom__diff__deletions">
							-{props.deletions}
						</div>
					</Show>
				</div>
			</div>
		</div>
	);
};
