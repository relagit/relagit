import { createEffect, createSignal, For, JSX, Show } from 'solid-js';
import { Portal } from 'solid-js/web';

import './index.scss';

export type IMenuItem =
	| {
			type: 'item';
			label: string;
			disabled?: boolean;
			onClick?: () => void;
			color?: 'default' | 'danger';
	  }
	| {
			type: 'separator';
	  };

export interface IMenu {
	children?: JSX.Element | JSX.Element[];
	items: IMenuItem[];
	event?: string;
}

export default (props: IMenu) => {
	const [open, setOpen] = createSignal(false);

	let menu: HTMLDivElement;
	let wrapper: HTMLDivElement;
	const [x, setX] = createSignal(0);
	const [y, setY] = createSignal(0);

	const hide = () => {
		setOpen(false);
	};

	const click = (e) => {
		if (menu === e.target) return;

		if (!menu.contains(e.target)) return setOpen(false);
	};

	const wrapperListener = (e: MouseEvent) => {
		e.stopPropagation();

		setX(e.clientX);
		setY(e.clientY);

		setOpen(!open());
	};

	createEffect(() => {
		const menuHeight = menu?.offsetHeight;
		const windowHeight = window.innerHeight;

		const menuWidth = menu?.offsetWidth;
		const windowWidth = window.innerWidth;

		if (y() + menuHeight > windowHeight - 10) {
			setY((v) => v - (v + menuHeight - windowHeight) - 10);
		}

		if (x() + menuWidth > windowWidth - 10) {
			setX((v) => v - (v + menuWidth - windowWidth) - 10);
		}

		if (open()) {
			document.addEventListener('mousedown', click);
			document.addEventListener('contextmenu', hide);
		} else {
			document.removeEventListener('mousedown', click);
			document.removeEventListener('contextmenu', hide);
		}

		wrapper.addEventListener(props.event || 'contextmenu', wrapperListener);
	});

	return (
		<>
			<Show when={open()}>
				<Portal mount={document.getElementById('app-container')}>
					<div
						ref={menu}
						class="menu"
						style={{
							'--x': `${x()}px`,
							'--y': `${y()}px`
						}}
					>
						<For each={props.items}>
							{(item) => {
								switch (item.type) {
									case 'separator':
										return <div class="menu__separator"></div>;
									case 'item':
										return (
											<div
												class={`menu__item ${item.color || ''} ${
													item.disabled ? 'disabled' : ''
												}`}
												data-id={item.label
													.toLowerCase()
													.replace(/\W/g, '-')}
												onClick={() => {
													if (!item.onClick) return setOpen(false);

													item.onClick();

													setOpen(false);
												}}
											>
												{item.label}
											</div>
										);
								}
							}}
						</For>
					</div>
				</Portal>
			</Show>
			<div class="contextmenu-wrapper" ref={wrapper}>
				{props.children}
			</div>
		</>
	);
};
