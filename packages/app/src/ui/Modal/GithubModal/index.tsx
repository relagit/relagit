import { Show, createResource, For } from 'solid-js';

import { GithubResponse } from './types';

import Modal, { ModalBody, ModalCloseButton, ModalHeader } from '..';
import EmptyState from '@app/ui/Common/EmptyState';
import Icon from '@app/ui/Common/Icon';
import Layer from '@ui/Layer';

import './index.scss';

let languageFile;

fetch('https://raw.githubusercontent.com/ozh/github-colors/master/colors.json')
	.then((r) => r.json())
	.then((r) => (languageFile = r));

const getLanguageColor = (language: string) => {
	return languageFile[language]?.color || '#000';
};

export default () => {
	const [response] = createResource(async () => {
		const response = await fetch('https://api.github.com/users/TheCommieAxolotl/repos');

		return (await response.json()) as GithubResponse['user/repos'];
	});

	const makeSorter = () => {
		return (a: GithubResponse['user/repos'][0], b: GithubResponse['user/repos'][0]) => {
			if (a.stargazers_count > b.stargazers_count) {
				return -1;
			}

			if (a.stargazers_count < b.stargazers_count) {
				return 1;
			}

			return 0;
		};
	};

	return (
		<Modal size="x-large" dismissable transitions={Layer.Transitions.Fade}>
			{(props) => {
				return (
					<>
						<ModalHeader
							title={
								<>
									Clone from{' '}
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
							<Show when={response.loading}>
								<EmptyState
									detail="Loading..."
									hint="Please wait while we fetch your repositories."
								/>
							</Show>
							<Show when={response.error}>
								<EmptyState
									detail="Oops! Something went wrong."
									hint="We dropped the ball while trying to gather your repositories."
								/>
							</Show>
							<Show when={response()}>
								<div class="github-modal__list">
									<For each={response().sort(makeSorter())}>
										{(repo) => (
											<div
												aria-role="button"
												aria-label={`Clone ${repo.name}`}
												tabIndex={0}
												onClick={() => {
													props.close();
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
						</ModalBody>
					</>
				);
			}}
		</Modal>
	);
};
