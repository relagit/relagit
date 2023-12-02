import { JSX, Show, createEffect, createSignal } from 'solid-js';

import { t } from '@app/modules/i18n';
import { PassthroughRef } from '@app/ui/shared';
import * as ipc from '~/common/ipc';

import Icon from '../Icon';
import TextArea from '../TextArea';

import './index.scss';

const ipcRenderer = window.Native.DANGEROUS__NODE__REQUIRE(
	'electron:ipcRenderer'
) as typeof import('electron').ipcRenderer;

export interface IFileSelectProps {
	input: boolean;
	initial?: string;
	properties: string[];
	validate?: (path: string) => string | boolean | JSX.Element | null;
	onSelect: (path: string) => void;
	disabled?: boolean;
	className?: string;
	filters?: {
		name: string;
		extensions: string[];
	}[];
}

export default (props: PassthroughRef<IFileSelectProps>) => {
	const [inputValue, setInputValue] = createSignal(props.initial || '');
	const [valid, setValid] = createSignal<string | boolean | JSX.Element>(null);
	const [status, setStatus] = createSignal<'valid' | 'invalid' | null>(null);

	createEffect(() => {
		if (props.validate) {
			setValid(props.validate(inputValue()));

			const validType = typeof valid();

			setStatus(
				valid() !== null
					? validType === 'string' || valid() === false || validType === 'object'
						? 'invalid'
						: 'valid'
					: null
			);
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
		<div class="filepicker" ref={props.ref}>
			<div
				class={`filepicker__input ${
					status() === 'valid' ? 'valid' : status() === 'invalid' ? 'invalid' : ''
				}`}
			>
				<Show when={props.input}>
					<TextArea
						label={t('ui.filepicker.label')}
						value={inputValue()}
						placeholder={
							props.properties.includes('openFile')
								? t('ui.filepicker.placeholder')
								: t('ui.filepicker.folderPlaceholder')
						}
						disabled={props.disabled}
						onChange={(v) => {
							setInputValue(v);

							props.onSelect(v);
						}}
					/>
				</Show>
				<button
					aria-role="button"
					aria-label={t('ui.filepicker.label')}
					aria-disabled={props.disabled}
					class="filepicker__input__button"
					onClick={openDialog}
					disabled={props.disabled}
				>
					<Icon name="file-directory" />
				</button>
			</div>
			<div
				class={`filepicker__alert ${
					status() === 'valid' ? 'valid' : status() === 'invalid' ? 'invalid' : ''
				}`}
			>
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
