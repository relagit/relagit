import { For, createSignal } from 'solid-js';

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
			<For each={props.items}>
				{(item) => (
					<div
						aria-role="button"
						aria-label={item.label}
						aria-selected={value() === item.value}
						aria-disabled={item.disabled || props.disabled}
						class={`segmented-control__item ${value() === item.value ? 'active' : ''} ${
							item.disabled ? 'disabled' : ''
						}`}
						tabIndex={0}
						onClick={() => {
							if (item.disabled || props.disabled) return;

							setValue(item.value);

							props.onChange(item.value);
						}}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								if (item.disabled || props.disabled) return;

								setValue(item.value);

								props.onChange(item.value);
							}
						}}
					>
						{item.label}
					</div>
				)}
			</For>
		</div>
	);
};
