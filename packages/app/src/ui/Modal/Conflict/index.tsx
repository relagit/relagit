import Modal, { ModalBody, ModalCloseButton, ModalFooter, ModalHeader, showErrorModal } from '..';
import { createRoot } from 'solid-js';

import { t } from '@app/modules/i18n';
import { refetchRepository } from '~/app/src/modules/actions';
import * as Git from '~/app/src/modules/git';
import ModalStore from '~/app/src/stores/modal';
import { Repository } from '~/app/src/stores/repository';

import Button from '../../Common/Button';

import './index.scss';

export const ConflictModal = (props: { repository: Repository }) => {
	return (
		<Modal size="medium" dismissable id={'conflict'}>
			{(p) => {
				return (
					<>
						<ModalHeader title={t('modal.conflict.title')}>
							<ModalCloseButton close={p.close} />
						</ModalHeader>
						<ModalBody>
							<p class="conflict-modal__message">
								{t('modal.conflict.message')}
							</p>
							<p class="conflict-modal__hint">
								{t('modal.conflict.hint')}
							</p>
						</ModalBody>
						<ModalFooter>
							<div class="modal__footer__buttons">
								<Button
									type="default"
									label={t('modal.close')}
									onClick={p.close}
								>
									{t('modal.close')}
								</Button>
								<Button
									type="danger"
									label={t('modal.conflict.abort')}
									dedupe
									onClick={async () => {
										try {
											await Git.MergeAbort(props.repository);

											await refetchRepository(props.repository);

											p.close();
										} catch (e) {
											showErrorModal(e, 'error.git');
										}
									}}
								>
									{t('modal.conflict.abort')}
								</Button>
							</div>
						</ModalFooter>
					</>
				);
			}}
		</Modal>
	);
};

export const showConflictModal = (repository: Repository | undefined) => {
	if (!repository) return;

	ModalStore.pushState(
		'conflict',
		createRoot(() => <ConflictModal repository={repository} />)
	);
};
