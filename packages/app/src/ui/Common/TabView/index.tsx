import { For, JSX, Show, Signal, createSignal } from 'solid-js';

import { IconName } from '../Icon';
import SegmentedControl from '../SegmentedControl';

import './index.scss';

export interface TabViewProps<T extends string> {
	signal?: Signal<T>;
	views: {
		element: JSX.Element;
		value: T;
		label: string;
		scroller?: boolean;
		disabled?: boolean;
		icon?: IconName;
	}[];
}

export default <T extends string>(props: TabViewProps<T>) => {
	const [selectedView, setSelectedView] = props.signal || createSignal<T>(props.views[0].value);

	return (
		<div class="segmented-view">
			<SegmentedControl
				value={selectedView()}
				onChange={(v): void => {
					setSelectedView(() => v);
				}}
				items={Object.values(props.views).map((v) => ({
					value: v.value,
					label: v.label,
					disabled: v.disabled,
					icon: v.icon
				}))}
			/>
			<div
				classList={{
					'segmented-view__body': true,
					'no-x': true,
					scroller:
						props.views.find((v) => v.value === selectedView())?.scroller !== false
				}}
			>
				<For each={props.views}>
					{(view) => {
						return (
							<Show when={view.value === selectedView()}>
								<div
									classList={{
										'segmented-view__body__view': true,
										active: view.value === selectedView()
									}}
								>
									{view.element}
								</div>
							</Show>
						);
					}}
				</For>
			</div>
		</div>
	);
};
