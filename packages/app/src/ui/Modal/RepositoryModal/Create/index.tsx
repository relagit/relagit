const fs = window.Native.DANGEROUS__NODE__REQUIRE('fs') as typeof import('fs');

import { Signal, createEffect, createSignal } from 'solid-js';

import SettingsStore from '@stores/settings';
import { Init } from '@modules/git';

import SegmentedControl from '@ui/Common/SegmentedControl';
import { ModalBody, ModalFooter } from '@ui/Modal';
import FileSelect from '@ui/Common/FileSelect';
import Button from '@ui/Common/Button';

import './index.scss';

export interface ICreateRepositoryModalProps {
	pathSignal: Signal<string>;
	tabSignal: Signal<number>;
	modalProps: {
		close: () => void;
	};
}

export default (props: ICreateRepositoryModalProps) => {
	const fileValidator = (p: string) => {
		if (p.length === 0) return null;

		const exists = fs.existsSync(p);

		if (!exists) return 'Directory does not exist';

		let isDirectory = false;

		try {
			const dir = fs.opendirSync(p);

			dir.close();

			isDirectory = true;
		} catch (e) {
			console.error(e);
			isDirectory = false;
		}

		if (!isDirectory) return 'Path is not a directory';

		return true;
	};

	const [allowClose, setAllowClose] = createSignal(false);
	// const [branch, setBranch] = createSignal("master");

	createEffect(() => {
		const hasPath = props.pathSignal[0]().length > 0;
		// const hasBranch = branch().length > 0;
		const valid = fileValidator(props.pathSignal[0]());

		setAllowClose(hasPath && valid === true);
	});

	return (
		<>
			<ModalBody>
				<SegmentedControl
					items={[
						{
							label: 'Add',
							value: 0
						},
						{
							label: 'Create',
							value: 1
						}
					]}
					value={props.tabSignal[0]()}
					onChange={(v) => {
						props.tabSignal[1](v as number);
					}}
				/>
				<div class="repo__modal__body">
					<FileSelect
						input
						initial={props.pathSignal[0]()}
						validate={fileValidator}
						properties={['openDirectory', 'createDirectory']}
						onSelect={(path) => {
							props.pathSignal[1](path);
						}}
					/>
					{/* <div class="create__repo__modal__body__input">
                        <div class="create__repo__modal__body__input__label">Branch</div>
                        <TextArea
                            placeholder="master"
                            value={branch()}
                            onChange={(v) => {
                                setBranch(v);
                            }}
                        />
                    </div> */}
				</div>
			</ModalBody>
			<ModalFooter>
				<div class="modal__footer__buttons">
					<Button type="default" onClick={props.modalProps.close}>
						Cancel
					</Button>
					<Button
						type="brand"
						onClick={async () => {
							props.modalProps.close();

							await Init(props.pathSignal[0]());

							SettingsStore.setSetting('repositories', [
								...(SettingsStore.getSetting('repositories') as string[]),
								props.pathSignal[0]()
							]);
						}}
						disabled={!allowClose()}
					>
						Create
					</Button>
				</div>
			</ModalFooter>
		</>
	);
};
