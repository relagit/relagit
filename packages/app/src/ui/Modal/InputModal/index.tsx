import Modal, { ModalBody, ModalCloseButton, ModalFooter, ModalHeader } from '..';
import { createRoot, createSignal } from 'solid-js';

import { t } from '@app/modules/i18n';
import ModalStore from '~/app/src/stores/modal';

import Button from '../../Common/Button';
import TextArea from '../../Common/TextArea';

export const InputModal = (props: {
	title: string;
	opts?: {
		cancel?: string;
		confirm?: string;
		type?: 'text' | 'password';
	};
	onConfirm?: (val: string) => void;
	onCancel?: () => void;
}) => {
	const [value, setValue] = createSignal('');

	return (
		<Modal size="small" id={'input'}>
			{(p) => {
				return (
					<>
						<ModalHeader title={props.title || t('modal.input.title')}>
							<ModalCloseButton close={p.close} />
						</ModalHeader>
						<ModalBody>
							<TextArea
								type={props.opts?.type || 'text'}
								label={props.title || t('modal.input.title')}
								value={value()}
								onChange={(val) => setValue(val)}
								placeholder={'•••••••••••••••'}
							/>
						</ModalBody>
						<ModalFooter>
							<div class="modal__footer__buttons">
								<Button
									type="default"
									label={props.opts?.cancel || t('modal.cancel')}
									onClick={() => {
										props.onCancel?.();

										p.close();
									}}
								>
									{props.opts?.cancel || t('modal.cancel')}
								</Button>
								<Button
									type="brand"
									label={props.opts?.confirm || t('modal.input.confirm')}
									disabled={value().length === 0}
									onClick={() => {
										props.onConfirm?.(value());

										p.close();
									}}
								>
									{props.opts?.confirm || t('modal.input.confirm')}
								</Button>
							</div>
						</ModalFooter>
					</>
				);
			}}
		</Modal>
	);
};

export const showInputModal = (
	title: string,
	opts?: { cancel?: string; confirm?: string; type?: 'text' | 'password' },
	onConfirm?: (val: string) => void,
	onCancel?: () => void
): Promise<string | undefined> => {
	return new Promise((resolve, reject) => {
		ModalStore.pushState(
			'input',
			createRoot(() => (
				<InputModal
					title={title}
					opts={opts}
					onConfirm={(val) => {
						onConfirm?.(val);
						resolve(val);
					}}
					onCancel={() => {
						onCancel?.();
						reject();
					}}
				/>
			))
		);
	});
};
