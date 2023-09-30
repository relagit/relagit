import { Show, createSignal } from 'solid-js';

import { useI18n } from '@app/modules/i18n';

import Modal, { ModalCloseButton, ModalHeader } from '..';
import Create from './Create';
import Layer from '@ui/Layer';
import Add from './Add';

import './index.scss';

export interface IRepositoryModalProps {
	tab: 'add' | 'create';
}

export default (props: IRepositoryModalProps) => {
	const [tab, setTab] = createSignal(props.tab ? (props.tab === 'add' ? 0 : 1) : 0);
	const draftPath = createSignal('');

	const t = useI18n();

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
