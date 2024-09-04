import { Show } from 'solid-js';

import { t } from '@app/modules/i18n';
import { openExternal, showItemInFolder } from '@app/modules/shell';
import { createStoreListener } from '@app/stores';
import LocationStore from '@app/stores/location';
import RepositoryStore from '@app/stores/repository';
import Button from '@app/ui/Common/Button';
import { showCloneModal } from '@app/ui/Modal/CloneModal';

import Anchor from '@ui/Common/Anchor';

import './index.scss';

const path = window.Native.DANGEROUS__NODE__REQUIRE('path');

export interface SubmoduleViewProps {
	repository: string;
	path: string;
}

export default () => {
	const file = createStoreListener(
		[LocationStore, RepositoryStore],
		() => LocationStore.selectedFile
	);

	return (
		<div class="submodule-view">
			<Show when={file()}>
				<div class="submodule-view__header">{t('codeview.submodule.title')}</div>
				<div class="submodule-view__info">
					<div class="submodule-view__info__item">
						{t('codeview.submodule.cloned')}{' '}
						<code
							tabIndex={0}
							onClick={() => {
								showItemInFolder(
									path.join(
										LocationStore.selectedRepository!.path!,
										file()!.submodule!.path()
									)
								);
							}}
						>
							{file()!.submodule!.path()}
						</code>
					</div>
					<div class="submodule-view__info__item">
						{t('codeview.submodule.from')}{' '}
						<Anchor
							onClick={() => {
								openExternal(
									file()!.submodule!.url() ||
										LocationStore.selectedRepository!.remote!.url()
								);
							}}
						>
							{file()!.submodule!.url() || 'origin'}
						</Anchor>
					</div>
					<div class="submodule-view__info__item">
						{t('codeview.submodule.revision')}{' '}
						<code>{file()!.submodule!.branch()}</code>
					</div>
				</div>
				<Show
					when={!RepositoryStore.getByRemote(file()!.submodule!.url()!)}
					fallback={
						<div class="submodule-view__clone">
							<div class="submodule-view__clone__header">
								{t('codeview.submodule.clonedHint')}
							</div>
							<Button
								label={t('codeview.submodule.open', {
									name: RepositoryStore.getByRemote(file()!.submodule!.url()!)
										?.name
								})}
								onClick={() => {
									LocationStore.setSelectedRepository(
										RepositoryStore.getByRemote(file()!.submodule!.url()!)
									);
								}}
								type="brand"
							>
								{t('codeview.submodule.open', {
									name: RepositoryStore.getByRemote(file()!.submodule!.url()!)
										?.name
								})}
							</Button>
						</div>
					}
				>
					<div class="submodule-view__clone">
						<div class="submodule-view__clone__header">
							{t('codeview.submodule.cloneHint')}
						</div>
						<Button
							label={t('codeview.submodule.clone')}
							onClick={() => {
								showCloneModal('url', file()!.submodule!.url() || '');
							}}
							type="brand"
						>
							{t('codeview.submodule.clone')}
						</Button>
					</div>
				</Show>
			</Show>
		</div>
	);
};
