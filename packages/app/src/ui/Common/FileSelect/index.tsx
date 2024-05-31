import { JSX, Setter, Show, createEffect, createSignal } from 'solid-js';
import * as ipc from '~/shared/ipc';

import { t } from '@app/modules/i18n';
import { PassthroughRef } from '@app/shared';

import Icon from '../Icon';
import TextArea from '../TextArea';

import './index.scss';

const ipcRenderer = window.Native.DANGEROUS__NODE__REQUIRE('electron:ipcRenderer');

export interface FileSelectProps {
	input: boolean;
	initial?: string;
	properties: string[];
	validate?: (path: string) => string | boolean | JSX.Element | null;
	onSelect: (path: string) => void;
	setError?: Setter<string>;
	disabled?: boolean;
	className?: string;
	filters?: {
		name: string;
		extensions: string[];
	}[];
}

export default (props: PassthroughRef<FileSelectProps>) => {
	const [inputValue, setInputValue] = createSignal(props.initial || '');
	const [valid, setValid] = createSignal<string | boolean | JSX.Element>(null);
	const [status, setStatus] = createSignal<'valid' | 'invalid' | null>(null);

	createEffect(() => {
		if (props.validate) {
			setValid(props.validate(inputValue()));

			let statusValue: null | 'valid' | 'invalid' = null;

			if (valid() !== null) {
				const validType = typeof valid();

				if (validType === 'string' || valid() === false || validType === 'object') {
					statusValue = 'invalid';
				} else {
					statusValue = 'valid';
				}
			}

			setStatus(statusValue);
		}
	}, [inputValue]);

	const openDialog = () => {
		if (props.disabled) return;

		ipcRenderer
			.invoke(ipc.OPEN_FILE_DIALOG, {
				properties: props.properties,
				filters: props.filters
			})
			.then((result: { canceled: boolean; filePaths: string[] }) => {
				if (result.canceled) return;

				setInputValue(result.filePaths[0]);

				props.onSelect(result.filePaths[0]);
			});
	};

	return (
		<div
			classList={{
				filepicker: true,
				[props.className || '']: true
			}}
			ref={props.ref}
		>
			<div classList={{ filepicker__input: true, [status()!]: true }}>
				<Show when={props.input}>
					<TextArea
						label={t('ui.filepicker.label')}
						value={inputValue()}
						placeholder={
							props.properties.includes('openFile') ?
								t('ui.filepicker.placeholder')
							:	t('ui.filepicker.folderPlaceholder')
						}
						disabled={props.disabled}
						onChange={(v) => {
							setInputValue(v);

							props.onSelect(v);
						}}
					/>
				</Show>
				<button
					role="button"
					aria-label={t('ui.filepicker.label')}
					aria-disabled={props.disabled}
					class="filepicker__input__button"
					onClick={openDialog}
					disabled={props.disabled}
				>
					<Icon name="file-directory" />
				</button>
			</div>
			<div classList={{ filepicker__alert: true, [status()!]: true }}>
				<Show when={status() === 'invalid'}>
					<Icon name="alert" />
					<span>{valid()}</span>
				</Show>
				<Show when={status() === 'valid'}>
					<Icon name="check" />
					<span>{t('ui.filepicker.valid')}</span>
				</Show>
			</div>
		</div>
	);
};
