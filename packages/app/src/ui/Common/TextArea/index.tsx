import { JSX, Show, createSignal } from 'solid-js';

import Icon, { IconName } from '../Icon';

import './index.scss';

interface TextareaProps {
	value: string;
	label: string;
	onChange: (value: string) => void;
	onContextMenu?: (e: MouseEvent) => void;
	onKeyDown?: (e: KeyboardEvent) => void;
	placeholder?: string;
	className?: string;
	disabled?: boolean;
	expanded?: boolean;
	footer?: JSX.Element;
	icon?: IconName;
	type?: 'password' | 'text';
}

export default (props: TextareaProps) => {
	const [hidden, setHidden] = createSignal(props.type === 'password');

	return (
		<div
			classList={{
				textarea__wrapper: true,
				expanded: props.expanded
			}}
			style={{ height: props.expanded ? '100%' : '' }}
		>
			<textarea
				aria-label={props.label}
				classList={{
					textarea: true,
					[props.className!]: true,
					expanded: props.expanded,
					'hide-data': hidden()
				}}
				spellcheck={false}
				value={props.value}
				onInput={(e) => {
					const proposedValue = e.target.value;

					if (!props.expanded && proposedValue.includes('\n')) {
						e.target.value = proposedValue.replace('\n', '');

						return props.onChange(proposedValue.replace('\n', ''));
					}

					props.onChange(proposedValue);
				}}
				onContextMenu={props.onContextMenu}
				onKeyDown={props.onKeyDown}
				placeholder={props.placeholder}
				disabled={props.disabled}
				style={{ height: props.expanded ? '100%' : '' }}
			/>
			<div class="textarea__footer">
				{props.footer}
				<Show when={props.type === 'password'}>
					<button
						class="sidebar__footer__textarea__button"
						onClick={() => setHidden(!hidden())}
						type="button"
					>
						<Show when={hidden()} fallback={<Icon name="eye-closed" />}>
							<Icon name="eye" />
						</Show>
					</button>
				</Show>
			</div>
		</div>
	);
};
