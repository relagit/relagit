import { JSX } from 'solid-js';

import { PassthroughRef } from '@app/shared';

import './index.scss';

interface ButtonProps {
	children: JSX.Element | JSX.Element[];
	type: 'default' | 'brand' | 'danger' | 'outline' | 'positive';
	onClick?: () => void;
	className?: string;
	disabled?: boolean;
	label: string;
	rest?: JSX.ButtonHTMLAttributes<HTMLButtonElement>;
}

export default (props: PassthroughRef<ButtonProps>) => {
	return (
		<button
			{...props.rest}
			ref={props.ref}
			aria-role="button"
			aria-label={props.label}
			aria-disabled={props.disabled}
			classList={{
				button: true,
				[props.type]: true,
				[props.className || '']: true
			}}
			onClick={props.onClick}
			disabled={props.disabled}
		>
			{props.children}
		</button>
	);
};
