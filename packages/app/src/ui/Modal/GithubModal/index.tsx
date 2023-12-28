import Modal, { ModalBody, ModalCloseButton, ModalFooter, ModalHeader, showErrorModal } from '..';
import { For, Show, createEffect, createSignal } from 'solid-js';

import * as Git from '@app/modules/git';
import { GitHub, GithubResponse } from '@app/modules/github';
import { t } from '@app/modules/i18n';
import { openExternal } from '@app/modules/shell';
import Button from '@app/ui/Common/Button';
import EmptyState from '@app/ui/Common/EmptyState';
import FileSelect from '@app/ui/Common/FileSelect';
import Icon from '@app/ui/Common/Icon';
import TextArea from '@app/ui/Common/TextArea';
import * as logger from '@modules/logger';

import Layer from '@ui/Layer';

import './index.scss';

const nodepath = window.Native.DANGEROUS__NODE__REQUIRE('path');
const fs = window.Native.DANGEROUS__NODE__REQUIRE('fs');

let languageFile: Record<string, { color: string }>;

fetch('https://raw.githubusercontent.com/ozh/github-colors/master/colors.json')
	.then((r) => r.json())
	.then((r) => (languageFile = r as Record<string, { color: string }>));

const getLanguageColor = (language: string) => {
	return languageFile[language]?.color || '#000';
};

const isEmpty = (path: string) => {
	const files = fs.readdirSync(path);

	return files.length === 0;
};

export default () => {
	const [response, setResponse] = createSignal<GithubResponse['users/:username/repos'][1] | null>(
		null
	);
	const [searchQuery, setSearchQuery] = createSignal('');
	const [readme, setReadme] = createSignal<
		GithubResponse['repos/:username/:repo/readme'][1] | null
	>();
	const [readmeHtml, setReadmeHtml] = createSignal<string | null>(null);
	const [opened, setOpened] = createSignal<
		GithubResponse['users/:username/repos'][1][number] | null
	>();
	const [cloneReady, setCloneReady] = createSignal(false);
	const [error, setError] = createSignal(false);
	const [path, setPath] = createSignal('');

	const makeSorter = () => {
		return (
			a: GithubResponse['users/:username/repos'][1][0],
			b: GithubResponse['users/:username/repos'][1][0]
		) => {
			if (a.stargazers_count > b.stargazers_count) {
				return -1;
			}

			if (a.stargazers_count < b.stargazers_count) {
				return 1;
			}

			return 0;
		};
	};

	const refetch = async () => {
		try {
			setError(false);

			setResponse(await GitHub('users/:username/repos').get(searchQuery()));
		} catch (e) {
			setResponse(null);
			setError(true);
		}
	};

	createEffect(async () => {
		if (!opened()) return;

		try {
			const readme = await GitHub('repos/:username/:repo/readme').get(
				searchQuery(),
				opened()!.name
			);
			const html = await GitHub('repos/:username/:repo/readme')
				.headers<string>({
					Accept: 'application/vnd.github.v3.html'
				})
				.get(searchQuery(), opened()!.name);

			setReadme(readme);
			setReadmeHtml(html);
		} catch (e) {
			setReadme(null);
			setReadmeHtml(null);
		}
	});

	return (
		<Modal size="x-large" dismissable transitions={Layer.Transitions.Fade}>
			{(props) => {
				return (
					<>
						<ModalHeader
							title={
								<>
									{t('modal.github.title')}
									<div class="github-modal__logo">
										<Icon name="mark-github" className="mark" />
										<Icon name="logo-github" className="logo" />
									</div>
								</>
							}
						>
							<ModalCloseButton {...props} />
						</ModalHeader>
						<ModalBody>
							<Show
								when={!cloneReady()}
								fallback={
									<div class="github-modal__clone">
										<Button
											onClick={() => {
												setCloneReady(false);
											}}
											label={t('modal.github.back')}
											type="default"
										>
											<Icon name="arrow-left" /> {t('modal.github.back')}
										</Button>
										<FileSelect
											input
											validate={(path) => {
												if (path.length === 0) return null;

												const exists = fs.existsSync(path);

												if (!exists) {
													return t('ui.filepicker.doesNotExist', {
														type: t('ui.filepicker.directory')
													});
												}

												let isDirectory = false;

												try {
													fs.opendirSync(path);

													isDirectory = true;
												} catch (e) {
													isDirectory = false;
												}

												if (!isDirectory)
													return t('ui.filepicker.isNot', {
														type: t('ui.filepicker.file'),
														expected: t('ui.filepicker.directory')
													});

												if (!isEmpty(path))
													return t('ui.filepicker.notEmpty', {
														type: t('ui.filepicker.directory')
													});

												return true;
											}}
											initial={path()}
											properties={['openDirectory', 'createDirectory']}
											onSelect={setPath}
										/>
									</div>
								}
							>
								<Show when={opened()}>
									<div class="github-modal__header">
										<Button
											onClick={() => {
												setOpened(null);
											}}
											label={t('modal.github.backToSearch')}
											type="default"
										>
											<Icon name="arrow-left" /> {t('modal.github.back')}
										</Button>
										<h2 class="github-modal__header__title">
											{opened()?.name}
										</h2>
										<div class="github-modal__header__social">
											<Show when={opened()?.stargazers_count}>
												<div class="github-modal__header__social__stars">
													<Icon name="star" />
													{opened()?.stargazers_count}
												</div>
											</Show>
											<Show when={opened()?.forks_count}>
												<div class="github-modal__header__social__forks">
													<Icon name="git-branch" />
													{opened()?.forks_count}
												</div>
												<Show when={opened()?.language}>
													<div class="github-modal__header__social__language">
														<div
															class="github-modal__header__social__language__indicator"
															style={{
																'background-color':
																	getLanguageColor(
																		opened()?.language || ''
																	)
															}}
														></div>
														{opened()?.language}
													</div>
												</Show>
											</Show>
										</div>
									</div>
									<div class="github-modal__details">
										<div class="github-modal__details__readme">
											<Show when={readme() && readmeHtml()}>
												<div class="github-modal__details__readme__path">
													{readme()?.path}
												</div>
												<div
													class="github-modal__details__readme__content"
													innerHTML={readmeHtml()?.replace(
														'src="./',
														`src="${nodepath.dirname(
															readme()?.download_url || ''
														)}/`
													)}
												></div>
											</Show>
										</div>
										<div class="github-modal__details__info">
											<div class="github-modal__details__info__actions">
												<Button
													label={t('modal.github.clone')}
													type="brand"
													onClick={() => {
														setCloneReady(true);
													}}
												>
													<Icon name="git-pull-request" />{' '}
													{t('modal.github.clone')}
												</Button>
												<Button
													label={t('modal.github.viewOnGithub')}
													type="default"
													onClick={() => {
														openExternal(opened()!.html_url);
													}}
												>
													{t('modal.github.viewOnGithub')}
												</Button>
											</div>
										</div>
									</div>
								</Show>
							</Show>
							<Show when={!opened()}>
								<div class="github-modal__header">
									<TextArea
										label={t('modal.github.search')}
										placeholder={t('modal.github.searchPlaceholder')}
										value={searchQuery()}
										onChange={setSearchQuery}
										onKeyDown={(e) => {
											if (e.key === 'Enter') {
												refetch();
											}
										}}
									/>
									<Button
										onClick={refetch}
										label={t('modal.github.search')}
										type="brand"
									>
										Search
									</Button>
								</div>
								<Show when={!response() && !error()}>
									<EmptyState
										detail={t('modal.github.loading')}
										hint={t('modal.github.loadingHint')}
									/>
								</Show>
								<Show when={error()}>
									<EmptyState
										detail={t('modal.github.error')}
										hint={t('modal.github.errorHint')}
									/>
								</Show>

								<Show when={response()}>
									<div class="github-modal__list">
										<For each={response()!.sort(makeSorter())}>
											{(repo) => (
												<div
													aria-role="button"
													aria-label={`${t('modal.github.clone')} ${
														repo.name
													}`}
													tabIndex={0}
													onClick={() => {
														setOpened(repo);
													}}
													onKeyDown={(e) => {
														if (e.key === 'Enter') {
															setOpened(repo);
														}
													}}
													class="github-modal__list__item"
												>
													<h3 class="github-modal__list__item__name">
														{repo.name}
													</h3>
													<p class="github-modal__list__item__description">
														{repo.description}
													</p>
													<div class="github-modal__list__item__details">
														<div class="github-modal__list__item__details__social">
															<Show when={repo.stargazers_count}>
																<div class="github-modal__list__item__details__social__stars">
																	<Icon name="star" />
																	{repo.stargazers_count}
																</div>
															</Show>
															<Show when={repo.forks_count}>
																<div class="github-modal__list__item__details__social__forks">
																	<Icon name="git-branch" />
																	{repo.forks_count}
																</div>
															</Show>
														</div>
														<Show when={repo.language}>
															<div class="github-modal__list__item__details__language">
																<div
																	class="github-modal__list__item__details__language__indicator"
																	style={{
																		'background-color':
																			getLanguageColor(
																				repo.language
																			)
																	}}
																></div>
																{repo.language}
															</div>
														</Show>
													</div>
												</div>
											)}
										</For>
									</div>
								</Show>
							</Show>
						</ModalBody>
						<Show when={cloneReady()}>
							<ModalFooter>
								<div class="modal__footer__buttons">
									<Button
										label={t('modal.github.clone')}
										type="default"
										onClick={() => {
											props.close();
										}}
									>
										{t('modal.cancel')}
									</Button>
									<Button
										label={t('modal.github.clone')}
										type="brand"
										disabled={!path()}
										onClick={async () => {
											try {
												await Git.Clone(opened()!.clone_url, path());

												props.close();
											} catch (e) {
												logger.error(e);

												showErrorModal(e, 'error.git');
											}
										}}
									>
										{t('modal.github.clone')}
									</Button>
								</div>
							</ModalFooter>
						</Show>
					</>
				);
			}}
		</Modal>
	);
};
