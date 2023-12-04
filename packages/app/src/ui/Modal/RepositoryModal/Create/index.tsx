import { Signal, createEffect, createSignal } from 'solid-js';

import { triggerWorkflow } from '@app/modules/actions';
import { t } from '@app/modules/i18n';
import { Init } from '@modules/git';
import SettingsStore from '@stores/settings';

import Button from '@ui/Common/Button';
import FileSelect from '@ui/Common/FileSelect';
import SegmentedControl from '@ui/Common/SegmentedControl';
import { ModalBody, ModalFooter } from '@ui/Modal';

import './index.scss';

const fs = window.Native.DANGEROUS__NODE__REQUIRE('fs') as typeof import('fs');

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

		if (!exists)
			return t('ui.filepicker.doesNotExist', {
				type: t('ui.filepicker.directory')
			});

		let isDirectory = false;

		try {
			fs.opendirSync(p);

			isDirectory = true;
		} catch (e) {
			isDirectory = false;
		}

		if (!isDirectory)
			return t('ui.filepicker.isNot', {
				type: t('ui.filepicker.file'),
				expected: t('ui.filepicker.directory')
			});

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
							label: t('modal.repository.add'),
							value: 0
						},
						{
							label: t('modal.repository.create'),
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
					<Button
						label={t('modal.repository.cancel')}
						type="default"
						onClick={props.modalProps.close}
					>
						{t('modal.repository.cancel')}
					</Button>
					<Button
						label={t('modal.repository.createRepo')}
						type="brand"
						onClick={async () => {
							props.modalProps.close();

							await Init(props.pathSignal[0]());

							SettingsStore.setSetting('repositories', [
								...SettingsStore.getSetting('repositories'),
								props.pathSignal[0]()
							]);

							triggerWorkflow('repository_add', props.pathSignal[0]());
						}}
						disabled={!allowClose()}
					>
						{t('modal.repository.create')}
					</Button>
				</div>
			</ModalFooter>
		</>
	);
};
