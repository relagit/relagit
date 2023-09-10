const path = window.Native.DANGEROUS__NODE__REQUIRE('path') as typeof import('path');
const fs = window.Native.DANGEROUS__NODE__REQUIRE('fs') as typeof import('fs');

import { Signal, createEffect, createSignal } from 'solid-js';

import SettingsStore from '@stores/settings';

import SegmentedControl from '@ui/Common/SegmentedControl';
import { ModalBody, ModalFooter } from '@ui/Modal';
import FileSelect from '@ui/Common/FileSelect';
import Anchor from '@ui/Common/Anchor';
import Button from '@ui/Common/Button';

export interface IAddRepositoryModalProps {
	pathSignal: Signal<string>;
	tabSignal: Signal<number | string>;
	modalProps: {
		close: () => void;
	};
}

export default (props: IAddRepositoryModalProps) => {
	const fileValidator = (p: string) => {
		if (p.length === 0) return null;

		const exists = fs.existsSync(p);

		if (!exists) return 'Directory does not exist';

		let isDirectory = false;

		try {
			fs.opendirSync(p);

			isDirectory = true;
		} catch (e) {
			console.error(e);
			isDirectory = false;
		}

		if (!isDirectory) return 'Path is not a directory';

		const isGit = fs.existsSync(path.join(p, '.git', 'HEAD'));

		if (!isGit)
			return (
				<>
					Directory is not a Git Repository. Would you like to{' '}
					<Anchor
						onClick={() => {
							props.tabSignal[1](1);
						}}
					>
						create one
					</Anchor>{' '}
					here instead?
				</>
			);

		return true;
	};

	const [allowClose, setAllowClose] = createSignal(false);

	createEffect(() => {
		const hasPath = props.pathSignal[0]().length > 0;
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
						properties={['openDirectory']}
						onSelect={(path) => {
							props.pathSignal[1](path);
						}}
					/>
				</div>
			</ModalBody>
			<ModalFooter>
				<div class="modal__footer__buttons">
					<Button type="default" onClick={props.modalProps.close}>
						Cancel
					</Button>
					<Button
						type="brand"
						onClick={() => {
							SettingsStore.setSetting('repositories', [
								...(SettingsStore.getSetting('repositories') as string[]),
								props.pathSignal[0]()
							]);

							props.modalProps.close();
						}}
						disabled={!allowClose()}
					>
						Add
					</Button>
				</div>
			</ModalFooter>
		</>
	);
};
