import Modal, { ModalCloseButton, ModalHeader } from '..';
import { Show, createRoot, createSignal } from 'solid-js';

import { t } from '@app/modules/i18n';
import ModalStore from '@app/stores/modal';

import Add from './Add';
import Create from './Create';

import './index.scss';

export interface RepositoryModalProps {
	tab: 'add' | 'create';
	path?: string;
}

let latestSetTab: (tab: number) => void;

const RepositoryModal = (props: RepositoryModalProps) => {
	let initialTab = 0;

	if (!props.tab || props.tab === 'add') {
		initialTab = 0;
	} else {
		initialTab = 1;
	}

	const [tab, setTab] = createSignal(initialTab);
	const draftPath = createSignal(props.path || '');

	latestSetTab = setTab;

	return (
		<Modal size="medium" dismissable id={`repository-${props.tab}`}>
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

export default RepositoryModal;

export const showRepoModal = (tab: RepositoryModalProps['tab'] = 'add', path?: string) => {
	if (ModalStore.state.active?.type.startsWith('repository'))
		return latestSetTab(tab === 'add' ? 0 : 1);

	ModalStore.pushState(
		`repository-${tab}`,
		createRoot(() => <RepositoryModal tab={tab} path={path} />)
	);
};
