export default {
	settings: {
		title: 'Optiones',
		close: 'Dimitte Optiones',
		workflows: {
			title: 'Workflows'
		},
		general: {
			title: 'Generalis',
			language: {
				label: 'Lingua',
				description: 'Linguam elige uti velis.'
			},
			editor: {
				label: 'Editor Externus',
				description: 'Editor elige uti velis ut limas aperire. Neustart requiritur.',
				code: 'VS Code',
				subl: 'Sublime Text',
				'code-insiders': 'VS Code Insiders',
				atom: 'Atom'
			},
			commitStyle: {
				label: 'Commit Nuntius Forma',
				description: 'Elige commit nuntis forma. Hoc solum facit current repository',
				conventional: 'Volgatus Commits',
				relational: 'Relational Commits',
				none: 'Nullus'
			},
			enforceCommitStyle: {
				label: 'Forma Nuntius Custodi Committ',
				description:
					'Hoc te impedit quominus committat si mandata tua committens non congruit formae receptae electae.'
			},
			preferParens: {
				label: 'Malo Parentheses',
				description: 'Malo parentheses super uncis angulis ad committendas nuntius formas.'
			}
		},
		appearance: {
			title: 'Aspectus',
			vibrancy: {
				label: 'Vibrance',
				description: 'Admitte sub Fenestra Vibrancy. Sileo requirit.'
			},
			theme: {
				label: 'Theme',
				description: 'Select thema uti velis.',
				light: 'Lux',
				dark: 'Dark',
				system: 'Systema'
			},
			font: {
				label: 'Custom Font',
				description:
					'Hoc defalta deprimet in codice font. aliquo fonte uti potes qui in systemate tuo inauguratus est.',
				placeholder: '"SF Mono", "IBM Plex Mono", "Fira Code", monospace'
			}
		}
	},
	error: {
		fetching: 'Inopinatum errorem in ducens repositiory status',
		remote: 'Inopinatum errorem inveniendo remotum statum',
		git: 'Inopinatum errorem exequens git imperium'
	},
	ui: {
		filepicker: {
			placeholder: 'Eligere lima...',
			label: 'Aperta file picker',
			valid: 'Valida lectio',
			directory: 'Directorium',
			file: 'File',
			doesNotExist: '{{type}} non existit',
			isNot: '{{type}} non {{expected}}'
		}
	},
	workspace: {
		commit: {
			open: 'Ite ad {{hash}}'
		}
	},
	sidebar: {
		commit: {
			label: 'Ite ad Commit {{hash}}'
		},
		drawer: {
			title: 'Repositoria',
			contextMenu: {
				createGroup: 'Fac Repository Group',
				addRepository: 'Add Repository',
				createRepository: 'Fac Repository',
				cloneFromGitHub: 'Exemplum fac a GitHub',
				viewIn: 'Ite ad {{name}}',
				remove: 'Aufer'
			},
			switchTo: 'Ite ad {{name}}',
			openSettings: 'Patefacio Optiones',
			settings: 'Optiones'
		},
		footer: {
			description: 'Descriptio',
			summary: 'Summa',
			commit: 'Commit ad {{branch}}'
		},
		openDrawer: 'Open Repository Drawer',
		upToDate: 'Tu omnes usque ad date.',
		noCommits: 'Neminem committit ut ostendat.',
		noRepo: 'Non Repository Selectae',
		noRepoHint: 'Unum eligere ut incipiat.',
		noBranch: 'Non germen',
		open: 'Ite ad {{name}}',
		contextMenu: {
			stage: 'Stage Mutationes',
			unstage: 'Unstage Mutationes',
			stash: 'Stash Mutationes',
			unstash: 'Unstash Mutationes',
			discard: 'Discard Mutationes',
			ignore: 'Add to gitignore',
			ignoreExt: 'Omnia adde .{{ext}} lima ut gitignore',
			viewIn: 'Ite ad {{name}}',
			openIn: 'Ite ad {{name}}',
			openRemote: 'Ite ad Longinquus'
		}
	},
	time: {
		second: ['{{count}} second', '{{count}} seconds'],
		minute: ['{{count}} momento', '{{count}} minuta'],
		hour: ['{{count}} hora', '{{count}} horas'],
		day: ['{{count}} dies', '{{count}} diebus'],
		month: ['{{count}} mensis', '{{count}} mensibus'],
		year: ['{{count}} anno', '{{count}} annis'],
		ago: 'ante',
		now: 'Nunc'
	},
	codeview: {
		noCommit: 'Nihil hic videre',
		noCommitHint: 'Elige tibi fasciculum ad eius mutationes videndas. (´・｀)',
		binary: 'Fasciculus binarius',
		binaryHint: 'Mea culpa! Diff non ostendere possumus.',
		loading: 'Exspecto...',
		loadingHint: 'Hoc non nimis longum.',
		errorHint: 'Aliquid abiit iniuriam dum tabella oneratisque.',
		noChanges: 'Nulla lite mutationes!',
		noChangesHint: 'Ite intermissum! merui.',
		noFile: 'Nulla files lectus.',
		noFileHint: 'Preme unum in pars ibi ut incipiat. (´・｀)',
		tooBig: 'Lima nimium potens!',
		tooBigHint: 'Scapus hic tam ingens est ut rationes perficiendi non reddemus.'
	},
	git: {
		pushChanges: 'Push Mutationes',
		pullChanges: 'Pull Mutationes',
		noChanges: 'Nulla Mutationes',
		diverged: 'Trees abscesserint',
		divergedHint: 'Stash Mutationes et pull',
		nothingToSee: 'Nihil hic videre',
		popStash: 'Pop Stash',
		commits: ['{{count}} commit', '{{count}} commits'],
		stashedChanges: ['{{count}} stashed mutatio', '{{count}} stashed mutationes']
	},
	modal: {
		closeModal: 'Dimitte Modal',
		confirm: 'Confirm',
		cancel: 'Dimitte',
		close: 'Dimitte',
		repository: {
			cancel: 'Dimitte',
			add: 'Add',
			create: 'Create',
			addRepo: 'Add Repository',
			createRepo: 'Fac Repository',
			notGit: 'Git Repositorium Directorium non est. Vis creare unum?'
		},
		reload: {
			title: 'Reload Client',
			message: 'Clientis reload faciet. Mutationes non salvabuntur. Es tu certus?'
		},
		error: {
			reload: 'Reload',
			reloadClient: 'Reload clientis'
		},
		github: {
			title: 'Exemplum fac a ',
			back: 'Retro',
			clone: 'Exemplum fac',
			backToSearch: 'Retro ad Search',
			search: 'Quaero',
			viewOnGithub: 'Ite ad GitHub',
			searchPlaceholder: 'Intra in GitHub User vel Unitarum',
			loading: 'Exspecto...',
			loadingHint: 'Exspecta quaeso dum repositoria tua invenimus.',
			error: 'Oops! Aliquid abiit iniuriam.',
			errorHint: 'Nos pilam demittimus dum repositoria tua colligere conatur.'
		}
	}
};
