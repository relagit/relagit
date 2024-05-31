import { For, Show, createSignal } from 'solid-js';

import Icon, { IconName } from '../Icon';

import './index.scss';

export interface SegmentedControlProps<T extends string | undefined> {
	items: {
		label: string;
		value: T;
		disabled?: boolean;
		icon?: IconName;
	}[];
	value: T;
	onChange: (value: T) => void;
	disabled?: boolean;
	className?: string;
}

export default <T extends string | undefined>(props: SegmentedControlProps<T>) => {
	const [value, setValue] = createSignal<T>(props.value || props.items[0].value);

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
						role="button"
						aria-label={item.label}
						aria-selected={value() === item.value}
						aria-disabled={item.disabled || props.disabled}
						classList={{
							'segmented-control__item': true,
							active: value() === item.value,
							disabled: item.disabled
						}}
						tabIndex={0}
						onMouseDown={() => {
							if (item.disabled || props.disabled) return;

							setValue(() => item.value);

							props.onChange(item.value);
						}}
						onKeyDown={(e) => {
							if (e.key === 'Enter') {
								if (item.disabled || props.disabled) return;

								setValue(() => item.value);

								props.onChange(item.value);
							}
						}}
					>
						<Show when={item.icon}>
							<Icon name={item.icon!} />
						</Show>
						{item.label}
					</div>
				)}
			</For>
		</div>
	);
};
