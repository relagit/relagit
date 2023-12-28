import { For, createSignal } from 'solid-js';

import './index.scss';

export interface SegmentedControlProps {
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

export default (props: SegmentedControlProps) => {
	const [value, setValue] = createSignal(props.value || props.items[0].value);

	return (
		<div
			classList={{
				'segmented-control': true,
				disabled: props.disabled,
				[props.className!]: true
			}}
		>
			<For each={props.items}>
				{(item) => (
					<div
						aria-role="button"
						aria-label={item.label}
						aria-selected={value() === item.value}
						aria-disabled={item.disabled || props.disabled}
						classList={{
							'segmented-control__item': true,
							active: value() === item.value,
							disabled: item.disabled
						}}
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
