import Modal, { ModalBody, ModalCloseButton, ModalFooter, ModalHeader, showErrorModal } from '..';
import { Show, createRoot, createSignal, onMount } from 'solid-js';

import { refetchRepository } from '@app/modules/actions';
import * as Git from '@app/modules/git';
import {
	GitHub,
	GitHubRepository,
	GithubOrg,
	GithubUser,
	initialiseGitHubFlow
} from '@app/modules/github';
import { t } from '@app/modules/i18n';
import { error } from '@app/modules/logger';
import AccountStore from '@app/stores/account';
import ModalStore from '@app/stores/modal';
import { Repository } from '@app/stores/repository';
import Button from '@app/ui/Common/Button';
import Dropdown from '@app/ui/Common/Dropdown';
import EmptyState from '@app/ui/Common/EmptyState';
import TextArea from '@app/ui/Common/TextArea';
import { Switch } from '@app/ui/Settings';
import { safeURL } from '~/app/src/shared';

import { showOAuthModal } from '../OAuthModal';

import './index.scss';

const PublishModal = (props: { repo: Repository }) => {
	const [name, setName] = createSignal(props.repo.name);
	const [description, setDescription] = createSignal('');
	const [isPrivate, setIsPrivate] = createSignal(true);
	const [willPush, setWillPush] = createSignal(false);
	const [owner, setOwner] = createSignal<GithubUser | GithubOrg | undefined>(
		AccountStore.getAccountFor('github')!
	);
	const [orgs, setOrgs] = createSignal<GithubOrg[]>([]);

	onMount(async () => {
		for await (const orgs of GitHub('user/orgs').stream()) {
			setOrgs(orgs);
		}
	});

	return (
		<Modal size="medium" dismissable id="publish">
			{(p) => (
				<>
					<ModalHeader title={t('modal.publish.title')}>
						<ModalCloseButton close={p.close} />
					</ModalHeader>
					<Show
						when={AccountStore.getAccountFor('github')}
						fallback={
							<EmptyState
								detail={t('modal.publish.auth')}
								hint={t('modal.publish.authHint')}
								icon="shield"
								actions={[
									{
										label: t('modal.publish.authButton'),
										type: 'brand',
										onClick: () => {
											initialiseGitHubFlow().then((r) => {
												showOAuthModal(r);
											});
										}
									}
								]}
							/>
						}
					>
						<ModalBody>
							<div class="publish-modal__content">
								<label class="publish-modal__content__label">
									{t('modal.publish.name')}
								</label>
								<TextArea
									label={t('modal.publish.name')}
									value={name()}
									placeholder={props.repo.name}
									onChange={(val) => {
										setName(val);
									}}
								/>
								<label class="publish-modal__content__label">
									{t('modal.publish.description')}
								</label>
								<TextArea
									label={t('modal.publish.description')}
									value={description()}
									placeholder={t('modal.publish.descriptionPlaceholder')}
									onChange={(val) => {
										setDescription(val);
									}}
								/>
								<label class="publish-modal__content__label">
									{t('modal.publish.owner')}
								</label>
								<Dropdown
									level={2}
									label={t('modal.publish.owner')}
									value={owner()}
									onChange={(val) => {
										setOwner(val);
									}}
									options={[
										{
											value: AccountStore.getAccountFor('github')!,
											label: AccountStore.getAccountFor('github')!.login,
											image: safeURL(
												AccountStore.getAccountFor('github')!.avatar_url
											)
										},
										...orgs().map((org) => ({
											value: org,
											label: org.login,
											image: safeURL(org.avatar_url)
										}))
									]}
								/>
								<Switch
									label={t('modal.publish.private')}
									value={isPrivate()}
									onChange={(val) => {
										setIsPrivate(val);
									}}
								/>
								<Switch
									label={t('modal.publish.push')}
									value={willPush()}
									onChange={(val) => {
										setWillPush(val);
									}}
								/>
								<label
									class="publish-modal__content__label"
									style="text-align: end; margin-top: 8px;"
								>
									{t('modal.publish.message', {
										url: `https://github.com/${owner()!.login}/${
											name() || props.repo.name
										}`
									})}
								</label>
							</div>
						</ModalBody>
						<ModalFooter>
							<div class="modal__footer__buttons">
								<Button
									label={t('modal.cancel')}
									type="default"
									onClick={() => {
										p.close();
									}}
								>
									{t('modal.cancel')}
								</Button>
								<Button
									label={t('modal.publish.publish', {
										name: name() || props.repo.name
									})}
									dedupe
									type="brand"
									disabled={!name() || !owner()}
									onClick={async () => {
										try {
											if (!owner()) return;

											let repo: GitHubRepository | undefined;

											if (owner()!.type !== 'User') {
												const res = await GitHub('orgs/:org/repos')
													.headers({
														Accept: 'application/vnd.github.v3+json'
													})
													.post(
														{
															name: name() || props.repo.name,
															description: description(),
															private: isPrivate()
														},
														owner()!.login
													);

												repo = res as unknown as GitHubRepository;
											} else {
												const res = await GitHub('user/repos')
													.headers({
														Accept: 'application/vnd.github.v3+json'
													})
													.post({
														name: name() || props.repo.name,
														description: description(),
														private: isPrivate()
													});

												repo = res as unknown as GitHubRepository;
											}

											try {
												await Git.AddRemote(
													props.repo,
													'origin',
													repo.clone_url
												);

												// we need to get remotes again
												await refetchRepository(props.repo);

												if (willPush()) {
													await Git.Push(props.repo);
												}

												await refetchRepository(props.repo);

												p.close();
											} catch (e) {
												error('Failed to add remote', e);
											}
										} catch (e) {
											showErrorModal(e, 'error.git');
										}
									}}
								>
									{t('modal.publish.publish', {
										name: name() || props.repo.name
									})}
								</Button>
							</div>
						</ModalFooter>
					</Show>
				</>
			)}
		</Modal>
	);
};

export const showPublishModal = (repo: Repository | undefined) => {
	if (!repo) return;

	ModalStore.pushState(
		'publish',
		createRoot(() => <PublishModal repo={repo} />)
	);
};
