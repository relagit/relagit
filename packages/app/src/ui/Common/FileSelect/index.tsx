const ipcRenderer = window.Native.DANGEROUS__NODE__REQUIRE(
	'electron:ipcRenderer'
) as typeof import('electron').ipcRenderer;

import { Show, createEffect, createSignal, JSX } from 'solid-js';

import TextArea from '../TextArea';
import Icon from '../Icon';

import * as ipc from '~/common/ipc';

import './index.scss';

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

export default (props: IFileSelectProps) => {
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
		<div class="filepicker">
			<div
				class={`filepicker__input ${
					status() === 'valid' ? 'valid' : status() === 'invalid' ? 'invalid' : ''
				}`}
			>
				<Show when={props.input}>
					<TextArea
						value={inputValue()}
						placeholder="Select a file..."
						disabled={props.disabled}
						onChange={(v) => {
							setInputValue(v);

							props.onSelect(v);
						}}
					/>
				</Show>
				<button
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
					<span>Valid Selection</span>
				</Show>
			</div>
		</div>
	);
};
