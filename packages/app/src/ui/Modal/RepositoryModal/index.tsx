import { Show, createSignal } from 'solid-js';

import Modal, { ModalCloseButton, ModalHeader } from '..';
import Create from './Create';
import Layer from '@ui/Layer';
import Add from './Add';

import './index.scss';

export default (props: { tab: 'add' | 'create' }) => {
	const [tab, setTab] = createSignal(props.tab ? (props.tab === 'add' ? 0 : 1) : 0);
	const draftPath = createSignal('');

	return (
		<Modal size="medium" dismissable transitions={Layer.Transitions.Fade}>
			{(props) => {
				return (
					<>
						<ModalHeader title="Add Repository">
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
