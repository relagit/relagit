const path = window.Native.DANGEROUS__NODE__REQUIRE('path') as typeof import('path');
const fs = window.Native.DANGEROUS__NODE__REQUIRE('fs') as typeof import('fs');

import { Signal, createEffect, createSignal } from 'solid-js';

import SettingsStore from '@stores/settings';
import { t } from '@app/modules/i18n';

import SegmentedControl from '@ui/Common/SegmentedControl';
import { ModalBody, ModalFooter } from '@ui/Modal';
import FileSelect from '@ui/Common/FileSelect';
import Button from '@ui/Common/Button';

export interface IAddRepositoryModalProps {
	pathSignal: Signal<string>;
	tabSignal: Signal<number>;
	modalProps: {
		close: () => void;
	};
}

export default (props: IAddRepositoryModalProps) => {
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

		const isGit = fs.existsSync(path.join(p, '.git', 'HEAD'));

		if (!isGit) return <>{t('modal.repository.notGit')}</>;

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
						properties={['openDirectory']}
						onSelect={(path) => {
							props.pathSignal[1](path);
						}}
					/>
				</div>
			</ModalBody>
			<ModalFooter>
				<div class="modal__footer__buttons">
					<Button label="Cancel" type="default" onClick={props.modalProps.close}>
						{t('modal.repository.cancel')}
					</Button>
					<Button
						label={t('modal.repository.addRepo')}
						type="brand"
						onClick={() => {
							SettingsStore.setSetting('repositories', [
								...SettingsStore.getSetting('repositories'),
								props.pathSignal[0]()
							]);

							props.modalProps.close();
						}}
						disabled={!allowClose()}
					>
						{t('modal.repository.add')}
					</Button>
				</div>
			</ModalFooter>
		</>
	);
};
