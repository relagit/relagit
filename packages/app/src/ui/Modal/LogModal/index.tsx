import Modal, { ModalBody, ModalCloseButton, ModalHeader } from '..';
import { For, createRoot } from 'solid-js';

import { commands } from '@app/modules/git/core';
import { t } from '@app/modules/i18n';
import ModalStore from '@app/stores/modal';
import { renderDate } from '~/app/src/modules/time';

import Tooltip from '../../Common/Tooltip';

import './index.scss';

const path = window.Native.DANGEROUS__NODE__REQUIRE('path');

export const LogModal = () => {
	return (
		<Modal size="x-large" dismissable id={'log'}>
			{(p) => {
				return (
					<>
						<ModalHeader title={t('modal.log.title')}>
							<ModalCloseButton close={p.close} />
						</ModalHeader>
						<ModalBody>
							<div class="log-modal__list">
								<For each={commands()}>
									{(cmd) => (
										<div class="log-modal__list__item">
											<div class="log-modal__list__item__command">
												{cmd.command}
												<div class="log-modal__list__item__command__args">
													<For each={cmd.args}>
														{(arg) => (
															<Tooltip
																delay={500}
																text={arg}
																level={2}
															>
																{(p) => (
																	<span {...p}>
																		{20 < arg.length ?
																			arg.substring(0, 40) +
																			'...'
																		:	arg}
																	</span>
																)}
															</Tooltip>
														)}
													</For>
												</div>
											</div>
											<div class="log-modal__list__item__info">
												{path.basename(cmd.path)}
												<div class="log-modal__list__item__info__time">
													{renderDate(cmd.time)()}
												</div>
											</div>
										</div>
									)}
								</For>
							</div>
						</ModalBody>
					</>
				);
			}}
		</Modal>
	);
};

export const showLogModal = () => {
	ModalStore.pushState('log', createRoot(LogModal));
};
