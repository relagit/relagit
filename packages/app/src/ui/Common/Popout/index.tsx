import { useFocusTrap } from '@solidjs-use/integrations/useFocusTrap';
import {
	Accessor,
	JSX,
	Setter,
	Show,
	Signal,
	createEffect,
	createSignal,
	onCleanup,
	onMount
} from 'solid-js';
import { Portal } from 'solid-js/web';
import { Transition } from 'solid-transition-group';

import { FloatingElement } from '../../Layer';

import './index.scss';

export interface Popout extends FloatingElement {
	children: (p: {
		show: (e?: MouseEvent | KeyboardEvent) => void;
		toggle: (e?: MouseEvent | KeyboardEvent) => void;
		hide: () => void;
		open: Accessor<boolean>;
		ref: Setter<HTMLElement | undefined>;
		getRef: Accessor<HTMLElement | undefined>;
	}) => JSX.Element | JSX.Element[];
	body: (p: {
		show: (e?: MouseEvent | KeyboardEvent) => void;
		toggle: (e?: MouseEvent | KeyboardEvent) => void;
		open: Accessor<boolean>;
		hide: () => void;
	}) => JSX.Element | JSX.Element[];
	position?: 'top' | 'bottom' | 'auto';
	align?: 'start' | 'end' | 'center';
	open?: Signal<boolean>;
	trapFocus?: boolean;
}

export default (props: Popout) => {
	const [open, setOpen] = props.open ?? createSignal(false);
	const [x, setX] = createSignal(0);
	const [y, setY] = createSignal(0);

	const [wrapper, setWrapper] = createSignal<HTMLElement>();
	const [popout, setPopout] = createSignal<HTMLElement>();

	const listener = () => {
		const rect = wrapper()?.getBoundingClientRect();

		if (!rect) return;

		setX(rect.left + rect.width / 2);
		setY(rect.top + rect.height / 2);
	};

	onMount(() => {
		window.addEventListener('resize', listener);
	});

	onCleanup(() => {
		window.removeEventListener('resize', listener);
	});

	const hide = () => {
		setOpen(false);

		deactivate();
	};

	createEffect(() => {
		if (open()) {
			listener();
		}
	});

	const show = (e?: MouseEvent | KeyboardEvent) => {
		e?.stopPropagation();
		e?.preventDefault();

		setOpen(true);

		activate();

		listener();

		// const el: HTMLElement | null | undefined = popout()?.querySelector(
		// 	'button,input,a,select,textarea,[tabindex]'
		// );

		// if (el) {
		// 	el.focus();
		// }
	};

	const toggle = (e?: MouseEvent | KeyboardEvent) => {
		e?.stopPropagation();

		if (open()) {
			hide();
		} else {
			show(e);
		}
	};

	const { activate, deactivate } = useFocusTrap(popout, {
		onDeactivate: () => {
			hide();
		},
		initialFocus: false,
		allowOutsideClick: true,
		clickOutsideDeactivates: (e) => {
			if (e.target === wrapper()) return false;

			return true;
		}
	});

	return (
		<>
			<props.children
				hide={hide}
				toggle={toggle}
				open={open}
				show={show}
				ref={setWrapper}
				getRef={wrapper}
			></props.children>
			<Portal mount={document.getElementById('app-container')!}>
				<Transition
					onEnter={(el, done) => {
						const a = el.animate(
							{
								opacity: [0, 1],
								translate: ['0 -4px', '0 0px'],
								scale: [0.95, 1]
							},
							{
								duration: 200,
								easing: 'ease-out'
							}
						);

						a.finished.then(done);
					}}
					onExit={(el, done) => {
						const a = el.animate(
							{
								opacity: [1, 0],
								translate: ['0 0px', '0 -4px'],
								scale: [1, 0.95]
							},
							{
								duration: 200,
								easing: 'ease-out'
							}
						);

						a.finished.then(done);
					}}
				>
					<Show when={open()}>
						<div
							role="menu"
							aria-expanded="true"
							aria-haspopup="true"
							classList={{
								popout: true,
								[props.position || 'top']: true,
								[props.align || 'center']: true
							}}
							ref={setPopout}
							style={{
								'--h': `${popout()?.offsetHeight}px`,
								'--w': `${popout()?.offsetWidth}px`,
								'--x': `${x()}px`,
								'--y': `${y()}px`,
								'--w-h': `${wrapper()?.offsetHeight}px`,
								'--w-w': `${wrapper()?.offsetWidth}px`,
								'--layer-index': props.level ?? 1
							}}
						>
							<props.body open={open} hide={hide} toggle={toggle} show={show} />
							<div class="popout__arrow"></div>
						</div>
					</Show>
				</Transition>
			</Portal>
		</>
	);
};
