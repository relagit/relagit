import { JSX } from 'solid-js';

import { IconName, customIcons } from '../Icon';

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
	icon?: IconName | keyof typeof customIcons;
}

export default (props: TextareaProps) => {
	return (
		<div class="textarea__wrapper" style={{ height: props.expanded ? '100%' : '' }}>
			<textarea
				aria-label={props.label}
				classList={{
					textarea: true,
					[props.className!]: true,
					expanded: props.expanded
				}}
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
			<div class="textarea__footer">{props.footer}</div>
		</div>
	);
};
