import { createSignal } from 'solid-js';

import './index.scss';

export interface ISenmentedControlProps {
	items: {
		label: string;
		value: string | number;
		disabled?: boolean;
	}[];
	value: string | number;
	onChange: (value: string | number) => void;
	disabled?: boolean;
	className?: string;
}

export default (props: ISenmentedControlProps) => {
	const [value, setValue] = createSignal(props.value || props.items[0].value);

	return (
		<div
			class={`segmented-control ${props.disabled ? 'disabled' : ''} ${props.className || ''}`}
		>
			{props.items.map((item) => (
				<div
					class={`segmented-control__item ${value() === item.value ? 'selected' : ''} ${
						item.disabled ? 'disabled' : ''
					}`}
					onClick={() => {
						if (item.disabled || props.disabled) return;

						setValue(item.value);

						props.onChange(item.value);
					}}
				>
					{item.label}
				</div>
			))}
		</div>
	);
};
