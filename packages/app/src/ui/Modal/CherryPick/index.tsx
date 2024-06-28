import Modal, { ModalBody, ModalCloseButton, ModalFooter, ModalHeader, showErrorModal } from '..';
import { For, Show, createEffect, createRoot, createSignal } from 'solid-js';
import { useInfiniteScroll } from 'solidjs-use';

import { t } from '@app/modules/i18n';
import { refetchRepository } from '~/app/src/modules/actions';
import * as Git from '~/app/src/modules/git';
import { Branch } from '~/app/src/modules/git/branches';
import { LogCommit } from '~/app/src/modules/git/log';
import { commitFormatsForProvider } from '~/app/src/modules/github';
import { renderDate } from '~/app/src/modules/time';
import ModalStore from '~/app/src/stores/modal';
import { Repository } from '~/app/src/stores/repository';

import Anchor from '../../Common/Anchor';
import Button from '../../Common/Button';
import EmptyState from '../../Common/EmptyState';

import './index.scss';

export const CherryPickModal = (props: { repository: Repository; branch: Branch }) => {
	const [commits, setCommits] = createSignal<LogCommit[]>([]);
	const [commitsRef, setCommitsRef] = createSignal<HTMLElement | null>(null);
	const [active, setActive] = createSignal<LogCommit | null>(null);

	createEffect(async () => {
		setCommits(
			await Git.Log(props.repository, 50, undefined, [
				props.branch.gitName,
				'^' + props.repository.branch
			])
		);
	});

	useInfiniteScroll(
		commitsRef,
		async () => {
			if (!props.repository) return;

			const newItems = await Git.Log(props.repository, 50, commits()[commits().length - 1], [
				props.branch.gitName,
				'^' + props.repository.branch
			]);

			if (newItems.some((item) => commits().some((c) => c.hash === item.hash))) {
				return; // we already have this item
			}

			setCommits((commits) => commits.concat(newItems));
		},
		{
			distance: 100
		}
	);

	return (
		<Modal size={commits().length ? 'large' : 'medium'} dismissable id={'cherryPick'}>
			{(p) => {
				return (
					<>
						<ModalHeader
							title={t('modal.cherryPick.title', {
								current: props.repository.branch,
								branch: props.branch.name
							})}
						>
							<ModalCloseButton close={p.close} />
						</ModalHeader>
						<ModalBody>
							<Show
								when={commits().length}
								fallback={
									<EmptyState
										detail={t('modal.cherryPick.noCommits')}
										hint={t('modal.cherryPick.noCommitsHint', {
											branch: props.branch.name,
											current: props.repository.branch
										})}
										icon="git-merge-queue"
									/>
								}
							>
								<div class="cherry-pick-modal__list" ref={setCommitsRef}>
									<For each={commits()}>
										{(commit) => (
											<>
												{/* <Show
													when={
														i() > 0 &&
														commits()[i() - 1].hash !== commit.parent
													}
												>
													<div class="cherry-pick-modal__list__divider">
														...
													</div>
												</Show> */}
												<button
													class="cherry-pick-modal__list__item"
													classList={{
														active: active() === commit
													}}
													onClick={() => {
														setActive(commit);
													}}
												>
													<div class="cherry-pick-modal__list__item__message">
														{commit.message}
													</div>
													<div class="cherry-pick-modal__list__item__info">
														<Anchor
															class="cherry-pick-modal__list__item__info__hash"
															href={`${props.repository.remote.replace(/\.git$/, '')}${commitFormatsForProvider(props.repository.remote || '', commit.hash)}`}
														>
															{commit.hash.substring(0, 7)}
														</Anchor>
														<div class="cherry-pick-modal__list__item__info__ref">
															{commit.refs}
														</div>
														<div class="cherry-pick-modal__list__item__info__author">
															{commit.author}
														</div>
														<div class="cherry-pick-modal__list__item__info__date">
															{renderDate(
																new Date(commit.date).getTime()
															)()}
														</div>
													</div>
												</button>
											</>
										)}
									</For>
								</div>
							</Show>
						</ModalBody>
						<Show when={active()}>
							<ModalFooter>
								<Button
									type="brand"
									label={t('modal.cherryPick.action')}
									dedupe
									onClick={async () => {
										try {
											await Git.CherryPick(props.repository, active());

											await refetchRepository(props.repository);

											p.close();
										} catch (e) {
											showErrorModal(e, 'error.git');
										}
									}}
								>
									{t('modal.cherryPick.action')}
								</Button>
							</ModalFooter>
						</Show>
					</>
				);
			}}
		</Modal>
	);
};

export const showCherryPickModal = (repository: Repository | undefined, branch: Branch) => {
	if (!repository) return;

	ModalStore.pushState(
		'cherryPick',
		createRoot(() => <CherryPickModal repository={repository} branch={branch} />)
	);
};
