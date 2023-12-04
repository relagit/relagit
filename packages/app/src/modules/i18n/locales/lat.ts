export default {
	onboarding: {
		takeTour: 'Incipio Tour',
		next: 'Proxima',
		dismiss: 'Dimitte',
		version: 'Versio {{version}}',
		header: {
			tooltip: 'Addere repositoria tua a repository picker.'
		},
		add: {
			tooltip: 'File picker uti potes ut repositorium tuum addas.',
			button: 'Addere nunc workspace tuo.'
		},
		history: {
			tooltip: 'Hic tuum commit historia videre potes.'
		},
		modal: {
			title: 'Proxima Gradus',
			themes: 'Client Themata',
			workflows: 'Workflows',
			github: 'Ite ad GitHub',
			somethingWrong: 'Aliquid abiit iniuriam?',
			issue: 'Issue Aperi'
		}
	},
	settings: {
		title: 'Optiones',
		close: 'Dimitte Optiones',
		restart: 'Neustart requiritur.',
		workflows: {
			title: 'Workflows'
		},
		commits: {
			title: 'Commits'
		},
		general: {
			title: 'Generalis',
			language: {
				label: 'Lingua',
				description: 'Linguam elige uti velis.'
			},
			editor: {
				label: 'Editor Externus',
				description: 'Editor elige uti velis ut limas aperire.',
				code: 'Visual Studio Code',
				subl: 'Sublime Text',
				'code-insiders': 'Visual Studio Code Insiders',
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
				description: 'Admitte sub Fenestra Vibrancy.'
			},
			theme: {
				label: 'Theme',
				description: 'Select thema uti velis.',
				light: 'Lux',
				dark: 'Dark',
				system: 'Systema',
				systemNote: 'Aspectus applicationis mutabitur secundum OS praeferentias.',
				choose: 'Elige {{theme}} thema'
			},
			font: {
				label: 'Custom Font',
				description:
					'Hoc defalta deprimet in codice font. aliquo fonte uti potes qui in systemate tuo inauguratus est.',
				placeholder: '"SF Mono", "IBM Plex Mono", "Fira Code", monospace'
			},
			clientThemes: {
				label: 'Clientis Themata',
				description: 'Elige usoris facta themata uti in clientem.'
			}
		}
	},
	error: {
		corruptSettings: 'Unum vel plura tua configuration files sunt corrupt. Quaeso eos reset.',
		fetching: 'Inopinatum errorem in ducens repositiory status',
		remote: 'Inopinatum errorem inveniendo remotum statum',
		git: 'Inopinatum errorem exequens git imperium'
	},
	ui: {
		filepicker: {
			placeholder: 'Eligere lima...',
			folderPlaceholder: 'Eligere directorium...',
			label: 'Aperta file picker',
			valid: 'Valida lectio',
			directory: ['Directorium', 'Directoria'],
			notEmpty: '{{type}} non est vacuus',
			file: ['Lima', 'Limae'],
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
			commit: 'Commit ad {{branch}}',
			add: 'Add'
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
		imageview: {
			error: 'Non potest invenire imaginem ostendere',
			errorHint: 'Hoc est quia imago est nimis magnus ut ostendere.'
		},
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
		sync: 'Sync',
		hide: 'Abscondere',
		publish: 'Mitte Germen',
		publishHint: 'Hoc germen ad remotum mitte.',
		branches: ['Germen', 'Germenes'],
		deleteBranch: 'Germen Aufer',
		newBranch: 'Novum germen',
		createBranch: 'Fac Germen',
		pushChanges: 'Push Mutationes',
		push: ['{{count}} mutationem push', '{{count}} mutationes push'],
		pullChanges: 'Pull Mutationes',
		pull: ['{{count}} mutationem pull', '{{count}} mutationes pull'],
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
