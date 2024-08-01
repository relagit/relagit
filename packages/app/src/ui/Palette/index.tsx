import { useFocusTrap } from '@solidjs-use/integrations/useFocusTrap';
import { For, Show, createEffect, createSignal } from 'solid-js';

import { t } from '@app/modules/i18n';
import { relative } from '@app/modules/time';
import { createStoreListener } from '@app/stores';
import LayerStore from '@app/stores/layer';
import LocationStore from '@app/stores/location';
import RepositoryStore, { Repository } from '@app/stores/repository';

import Layer from '../Layer';

import './index.scss';

const fuzzyMatch = (source: string, target: string): boolean => {
	source = source.toLowerCase();
	target = target.toLowerCase();

	let sourceIndex = 0;
	let targetIndex = 0;

	while (sourceIndex < source.length && targetIndex < target.length) {
		if (source[sourceIndex] === target[targetIndex]) {
			targetIndex++;
		}
		sourceIndex++;
	}

	return targetIndex === target.length;
};

const repoFilter = (repo: Repository, filter: string) => {
	return fuzzyMatch(repo.name, filter) || fuzzyMatch(repo.path, filter);
};

const repoSort = (a: Repository, b: Repository, filter: string) => {
	const aName = a.name.toLowerCase();
	const bName = b.name.toLowerCase();

	const aPath = a.path.toLowerCase();
	const bPath = b.path.toLowerCase();

	if (aName.includes(filter) && !bName.includes(filter)) return -1;
	if (!aName.includes(filter) && bName.includes(filter)) return 1;

	if (aPath.includes(filter) && !bPath.includes(filter)) return -1;
	if (!aPath.includes(filter) && bPath.includes(filter)) return 1;

	return 0;
};

export const CommandPalette = () => {
	const [input, setInput] = createSignal<HTMLInputElement>();
	const [index, setIndex] = createSignal(0);
	const [filter, setFilter] = createSignal('');
	const [showing, setShowing] = createSignal<Repository[]>([]);

	const repositories = createStoreListener([RepositoryStore], () => RepositoryStore.repositories);

	createEffect(() => {
		if (!filter().trim()) setShowing([]);

		const array = Array.from(repositories()!.values() || []);

		setShowing(array.filter((repo) => repoFilter(repo, filter().trim())));
	});

	const { activate, deactivate } = useFocusTrap(input, {
		onDeactivate: () => {
			LayerStore.setVisible('palette', false);
		},
		allowOutsideClick: true
	});

	window.Native.listeners.PALETTE((_, value) => {
		LayerStore.setVisible('palette', value ?? !LayerStore.visible('palette'));

		if (LayerStore.visible('palette')) {
			activate();
		} else {
			deactivate();
		}
	});

	return (
		<Layer index={3} key="palette" transitions={Layer.Transitions.None} type="bare">
			<div
				class="palette"
				onClick={(e) => {
					e.stopPropagation();

					LayerStore.setVisible('palette', false);
					deactivate();
				}}
			>
				<div
					onClick={(e) => {
						e.stopPropagation();
					}}
					class="palette__body"
				>
					<div class="palette__body__input" ref={setInput}>
						<input
							type="text"
							class="palette__body__input__input"
							placeholder={t('sidebar.drawer.title')}
							spellcheck={false}
							value={filter()}
							onKeyDown={(e) => {
								e.stopPropagation();

								if (e.key === 'Escape') {
									LayerStore.setVisible('palette', false);
									deactivate();

									return;
								}

								if (e.key === 'Enter') {
									const repo = showing()[index()];

									if (repo) {
										RepositoryStore.makePermanent(repo);
										LocationStore.setSelectedRepository(repo);
										LayerStore.setVisible('palette', false);

										deactivate();

										setIndex(0);
										setFilter('');

										return;
									}
								}

								if (e.key === 'ArrowUp' || (e.key === 'k' && e.ctrlKey)) {
									e.preventDefault();

									if (e.metaKey) {
										setIndex(0);
									} else {
										setIndex(index() - 1);
									}
								}

								if (e.key === 'ArrowDown' || (e.key === 'j' && e.ctrlKey)) {
									e.preventDefault();

									if (e.metaKey) {
										setIndex(showing().length - 1);
									} else {
										setIndex(index() + 1);
									}
								}

								if (index() < 0) setIndex(showing().length - 1);
								if (index() >= showing().length) setIndex(0);

								if (
									e.key === 'ArrowUp' ||
									e.key === 'ArrowDown' ||
									(e.key === 'k' && e.ctrlKey) ||
									(e.key === 'j' && e.ctrlKey)
								) {
									const element = document.getElementById(`pbli-${index()}`);

									if (element) {
										element.scrollIntoView({
											block: 'nearest'
										});
									}
								}
							}}
							onInput={(e) => {
								e.stopPropagation();

								setFilter(e.currentTarget.value);
							}}
						/>
						<div class="palette__body__input__hint">
							<Show when={filter() && showing().length}>
								{t(
									'palette.hint',
									{
										count: showing().length,
										total: RepositoryStore.repositories.size
									},
									RepositoryStore.repositories.size
								)}
							</Show>
						</div>
					</div>
					<Show when={filter().trim() && showing().length}>
						<div class="palette__body__separator"></div>
						<div
							class="palette__body__list"
							aria-live="assertive"
							aria-label={showing()[index()]?.name}
						>
							<For each={showing().sort((a, b) => repoSort(a, b, filter()))}>
								{(repository, i) => (
									<button
										id={`pbli-${i()}`}
										aria-selected={index() === i()}
										aria-label={repository.name}
										classList={{
											palette__body__list__item: true,
											active: index() === i()
										}}
										onClick={() => {
											RepositoryStore.makePermanent(repository);
											LocationStore.setSelectedRepository(repository);
											LayerStore.setVisible('palette', false);

											deactivate();

											setIndex(0);
											setFilter('');
										}}
									>
										<div class="palette__body__list__item__name">
											{repository.name}
										</div>
										<div class="palette__body__list__item__info">
											<Show when={repository.branch}>
												{repository.branch}
												<div class="palette__body__list__item__info__dot"></div>
											</Show>
											{relative(
												repository.lastFetched || new Date().getTime()
											)}
										</div>
										<div class="palette__body__list__item__return">{'↩'}</div>
									</button>
								)}
							</For>
						</div>
					</Show>
				</div>
			</div>
		</Layer>
	);
};
