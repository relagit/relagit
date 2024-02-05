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
								showItemInFolder(file()!.submodule!.path);
							}}
						>
							{file()!.submodule!.relativePath}
						</code>
					</div>
					<div class="submodule-view__info__item">
						{t('codeview.submodule.from')}{' '}
						<Anchor
							onClick={() => {
								openExternal(
									file()!.submodule!.remote ||
										LocationStore.selectedRepository!.remote!
								);
							}}
						>
							{file()!.submodule!.remote || 'origin'}
						</Anchor>
					</div>
					<div class="submodule-view__info__item">
						{t('codeview.submodule.revision')} <code>{file()!.submodule!.sha}</code>
					</div>
				</div>
				<div class="submodule-view__clone">
					<div class="submodule-view__clone__header">
						{t('codeview.submodule.cloneHint')}
					</div>
					<Button
						label={t('codeview.submodule.clone')}
						onClick={() => {
							showCloneModal('url', file()!.submodule!.remote || '');
						}}
						type="brand"
					>
						{t('codeview.submodule.clone')}
					</Button>
				</div>
			</Show>
		</div>
	);
};
