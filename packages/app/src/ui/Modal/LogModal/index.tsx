import Modal, { ModalBody, ModalCloseButton, ModalHeader } from '..';
import { For, Show, createRoot } from 'solid-js';

import { commands } from '@app/modules/git/core';
import { t } from '@app/modules/i18n';
import ModalStore from '@app/stores/modal';
import EmptyState from '@app/ui/Common/EmptyState';

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
								<For
									each={commands()}
									fallback={<EmptyState detail="hi" hint="hello" />}
								>
									{(cmd) => (
										<div class="log-modal__list__item">
											<div class="log-modal__list__item__command">
												{cmd.command}
												<div class="log-modal__list__item__command__args">
													<span>[</span>
													<For each={cmd.args}>
														{(arg, i) => (
															<span>
																{20 < arg.length
																	? arg.substring(0, 20) + '...'
																	: arg}
																<Show
																	when={
																		i() !== cmd.args.length - 1
																	}
																>
																	,
																</Show>
															</span>
														)}
													</For>
													<span>]</span>
												</div>
											</div>
											<div class="log-modal__list__item__path">
												{path.basename(cmd.path)}
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
