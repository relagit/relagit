import { useFocusTrap } from '@solidjs-use/integrations/useFocusTrap';
import { For, JSX, Show, createEffect, createSignal } from 'solid-js';
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

export interface Menu {
	children?: JSX.Element | JSX.Element[];
	items: IMenuItem[];
	event?: string;
}

export default (props: Menu) => {
	const [open, setOpen] = createSignal(false);

	const [wrapper, setWrapper] = createSignal<HTMLDivElement>();
	const [menu, setMenu] = createSignal<HTMLDivElement>();
	const [x, setX] = createSignal(0);
	const [y, setY] = createSignal(0);

	const { activate, deactivate } = useFocusTrap(menu, {
		initialFocus: false
	});

	const hide = () => {
		setOpen(false);

		deactivate();
	};

	const click = (e) => {
		if (menu() === e.target) return;

		if (!menu().contains(e.target)) return hide();
	};

	const wrapperListener = (e: MouseEvent) => {
		e.stopPropagation();

		setX(e.clientX || e.target?.['getBoundingClientRect']?.()?.x);
		setY(e.clientY || e.target?.['getBoundingClientRect']?.()?.y);

		const alreadyOpen = open();

		if (alreadyOpen) return hide();

		setOpen(true);

		activate();
	};

	createEffect(() => {
		const menuHeight = menu()?.offsetHeight;
		const windowHeight = window.innerHeight;

		const menuWidth = menu()?.offsetWidth;
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

		wrapper().addEventListener(props.event || 'contextmenu', wrapperListener);
	});

	return (
		<>
			<Show when={open()}>
				<Portal mount={document.getElementById('app-container')}>
					<div
						onKeyDown={(e) => {
							if (e.key === 'Escape') {
								hide();
							}
						}}
						ref={setMenu}
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
												aria-role="button"
												aria-label={item.label}
												classList={{
													menu__item: true,
													[item.color || '']: true,
													disabled: item.disabled
												}}
												data-id={item.label
													.toLowerCase()
													.replace(/\W/g, '-')}
												onClick={() => {
													if (!item.onClick) return hide();

													item.onClick();

													hide();
												}}
												onKeyDown={(e) => {
													if (e.key === 'Enter') {
														if (!item.onClick) return hide();

														item.onClick();

														hide();
													}
												}}
												tabIndex={0}
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
			<div class="contextmenu-wrapper" ref={setWrapper}>
				{props.children}
			</div>
		</>
	);
};
