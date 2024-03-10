import { JSX, createSignal } from 'solid-js';

import { PassthroughRef } from '@app/shared';

import './index.scss';

export interface ButtonProps {
	children: JSX.Element | JSX.Element[];
	type: 'default' | 'brand' | 'danger' | 'outline' | 'positive';
	onClick?: () => void | Promise<void>;
	className?: string;
	disabled?: boolean;
	dedupe?: boolean;
	label: string;
	rest?: JSX.ButtonHTMLAttributes<HTMLButtonElement>;
}

export default (props: PassthroughRef<ButtonProps>) => {
	const [tempDisabled, setTempDisabled] = createSignal(false);

	return (
		<button
			{...props.rest}
			ref={props.ref}
			aria-role="button"
			aria-label={props.label}
			aria-disabled={tempDisabled() || props.disabled}
			aria-busy={tempDisabled()}
			classList={{
				button: true,
				[props.type]: true,
				[props.className || '']: true
			}}
			onClick={async () => {
				if (props.dedupe) {
					if (tempDisabled()) {
						return;
					}

					setTempDisabled(true);
				}

				await props.onClick?.();

				setTempDisabled(false);
			}}
			disabled={tempDisabled() || props.disabled}
		>
			{props.children}
		</button>
	);
};
