import { useFocusTrap } from '@solidjs-use/integrations/useFocusTrap';
import { For, JSX, Show, createEffect, createSignal } from 'solid-js';
import { Portal } from 'solid-js/web';

import { useLayerContext } from '../Layer';

import './index.scss';

const extensions: Record<string, MenuItem[]> = {};

export type Accelerator = {
	shift?: boolean;
	meta?: boolean;
	alt?: boolean;
	key: string;
};

const meta = window.Native.platform === 'win32' ? '⌃' : '⌘';

export type MenuItem =
	| {
			type: 'item';
			label: string;
			disabled?: boolean;
			onClick?: (arg?: unknown) => void;
			accelerator?: Accelerator;
			color?: 'default' | 'danger';
	  }
	| {
			type: 'separator';
	  }
	| {
			type: 'label';
			label: string;
	  };

export interface Menu {
	children?: JSX.Element | JSX.Element[];
	items: MenuItem[];
	event?: keyof HTMLElementEventMap;
	interfaceId: string;
	forward?: unknown;
}

export default (props: Menu) => {
	const [open, setOpen] = createSignal(false);

	const [wrapper, setWrapper] = createSignal<HTMLDivElement>();
	const [menu, setMenu] = createSignal<HTMLDivElement>();
	const [x, setX] = createSignal(0);
	const [y, setY] = createSignal(0);

	const layerContext = useLayerContext('Menu');

	const { activate, deactivate } = useFocusTrap(menu, {
		initialFocus: false,
		onDeactivate: () => {
			hide();
		}
	});

	const accListener = (e: KeyboardEvent) => {
		for (const item of props.items) {
			if (item.type !== 'item') continue;

			if (!item.accelerator) continue;

			if (item.accelerator.shift && !e.shiftKey) continue;
			if (item.accelerator.meta && !e.metaKey) continue;
			if (item.accelerator.alt && !e.altKey) continue;
			if (item.accelerator.key !== e.key) continue;

			hide();
		}
	};

	const hide = () => {
		setOpen(false);

		deactivate();

		document.removeEventListener('keydown', accListener);
	};

	const click = (e: MouseEvent) => {
		if (menu() === e.target) return;

		if (!menu()?.contains(e.target as HTMLElement)) return hide();
	};

	const wrapperListener = (e: Event) => {
		e.stopPropagation();

		setX(
			(e as MouseEvent).clientX || (e.target as HTMLElement)?.['getBoundingClientRect']?.()?.x
		);
		setY(
			(e as MouseEvent).clientY || (e.target as HTMLElement)?.['getBoundingClientRect']?.()?.y
		);

		const alreadyOpen = open();

		if (alreadyOpen) return hide();

		setOpen(true);

		document.addEventListener('keydown', accListener);

		activate();
	};

	createEffect(() => {
		const menuHeight = menu()?.offsetHeight;
		const windowHeight = window.innerHeight;

		const menuWidth = menu()?.offsetWidth;
		const windowWidth = window.innerWidth;

		if (y() + menuHeight! > windowHeight - 10) {
			setY((v) => v - (v + menuHeight! - windowHeight) - 10);
		}

		if (x() + menuWidth! > windowWidth - 10) {
			setX((v) => v - (v + menuWidth! - windowWidth) - 10);
		}

		if (open()) {
			document.addEventListener('mousedown', click);
			document.addEventListener('contextmenu', hide);
		} else {
			document.removeEventListener('mousedown', click);
			document.removeEventListener('contextmenu', hide);
		}

		wrapper()?.addEventListener(props.event || 'contextmenu', wrapperListener);
	});

	return (
		<>
			<Show when={open()}>
				<Portal mount={document.getElementById('app-container')!}>
					<div
						onKeyDown={(e) => {
							if (e.key === 'Escape') {
								hide();
							}
						}}
						ref={setMenu}
						class="menu"
						data-id={props.interfaceId}
						style={{
							'--x': `${x()}px`,
							'--y': `${y()}px`,
							'--layer-index': layerContext
						}}
					>
						<Show when={props.items.filter(Boolean).length === 0}>
							<div tabIndex={0} aria-disabled class="menu__item disabled face">
								{'＼(´ ε｀ )／'}
							</div>
						</Show>
						<For each={props.items.filter(Boolean)}>
							{(item) => <MenuItem {...item} hide={hide} />}
						</For>
						<Show when={extensions[props.interfaceId]?.length}>
							<Show when={props.items.filter(Boolean).length}>
								<div class="menu__separator"></div>
							</Show>
							<For each={extensions[props.interfaceId]}>
								{(item) => (
									<MenuItem forward={props.forward} {...item} hide={hide} />
								)}
							</For>
						</Show>
					</div>
				</Portal>
			</Show>
			<div
				class="contextmenu-wrapper"
				ref={setWrapper}
				onKeyDown={(e) => {
					if (props.event === 'contextmenu' || !props.event) {
						if (e.key === 'Enter' && e.shiftKey) {
							e.preventDefault();
							e.stopPropagation();

							wrapperListener(e);
						}
					}
				}}
			>
				{props.children}
			</div>
		</>
	);
};

export const addExtensions = (id: string, items: MenuItem[]) => {
	extensions[id] ??= [];
	extensions[id].push(...items);
};

export const MenuItem = (
	props: MenuItem & {
		hide: () => void;
		forward?: unknown;
	}
) => {
	switch (props.type) {
		case 'label':
			return <div class="menu__label">{props.label}</div>;
		case 'separator':
			return <div class="menu__separator"></div>;
		case 'item':
			return (
				<div
					role="button"
					aria-label={props.label}
					classList={{
						menu__item: true,
						[props.color || '']: true,
						disabled: props.disabled
					}}
					data-id={props.label.toLowerCase().replace(/\W/g, '-')}
					onClick={() => {
						if (!props.onClick) return props.hide();

						props.onClick(props.forward);

						props.hide();
					}}
					onKeyDown={(e) => {
						if (e.key === 'Enter') {
							if (!props.onClick) return props.hide();

							props.onClick(props.forward);

							props.hide();
						}
					}}
					tabIndex={0}
				>
					{props.label}
					<Show when={props.accelerator}>
						<div class="menu__item__accelerator">
							<span>{props.accelerator?.shift ? '⇧' : null}</span>
							<span>{props.accelerator?.meta ? meta : null}</span>
							<span>{props.accelerator?.alt ? '⌥' : null}</span>
							<span>{props.accelerator?.key}</span>
						</div>
					</Show>
				</div>
			);
	}
};
