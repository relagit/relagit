import { For, JSX, Show, createSignal } from 'solid-js';

import SegmentedControl from '../SegmentedControl';

import './index.scss';

export interface TabViewProps {
	views: {
		element: JSX.Element;
		value: string | number;
		label: string;
		scroller?: boolean;
		disabled?: boolean;
	}[];
}

export default (props: TabViewProps) => {
	const [selectedView, setSelectedView] = createSignal<string | number>(props.views[0].value);

	return (
		<div class="segmented-view">
			<SegmentedControl
				value={selectedView()}
				onChange={(v) => {
					setSelectedView(v as string);
				}}
				items={Object.values(props.views).map((v) => ({
					value: v.value,
					label: v.label,
					disabled: v.disabled
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
										selected: view.value === selectedView()
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
