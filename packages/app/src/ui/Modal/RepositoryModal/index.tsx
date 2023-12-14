import Modal, { ModalCloseButton, ModalHeader } from '..';
import { Show, createSignal } from 'solid-js';

import { t } from '@app/modules/i18n';

import Layer from '@ui/Layer';

import Add from './Add';
import Create from './Create';

import './index.scss';

export interface RepositoryModalProps {
	tab: 'add' | 'create';
}

export default (props: RepositoryModalProps) => {
	let initialTab = 0;

	if (!props.tab || props.tab === 'add') {
		initialTab = 0;
	} else {
		initialTab = 1;
	}

	const [tab, setTab] = createSignal(initialTab);
	const draftPath = createSignal('');

	return (
		<Modal size="medium" dismissable transitions={Layer.Transitions.Fade}>
			{(props) => {
				return (
					<>
						<ModalHeader title={t('modal.repository.addRepo')}>
							<ModalCloseButton {...props} />
						</ModalHeader>
						<Show when={tab() === 0}>
							<Add
								pathSignal={draftPath}
								tabSignal={[tab, setTab]}
								modalProps={props}
							/>
						</Show>
						<Show when={tab() === 1}>
							<Create
								pathSignal={draftPath}
								tabSignal={[tab, setTab]}
								modalProps={props}
							/>
						</Show>
					</>
				);
			}}
		</Modal>
	);
};
