export default {
	onboarding: {
		takeTour: 'Take the Tour',
		next: 'Next',
		dismiss: 'Dismiss',
		version: 'Version {{version}}',
		header: {
			tooltip: 'Add your repositories from the repository picker.'
		},
		add: {
			tooltip: 'Use this file picker to add a repository from your device.',
			button: 'Now add it to your workspace.'
		},
		history: {
			tooltip: 'From here, you can view your commit history.'
		},
		modal: {
			title: 'Next Steps',
			themes: 'Browse Client Themes',
			workflows: 'Browse Workflows',
			github: 'View on GitHub',
			somethingWrong: 'Find something wrong?',
			issue: 'Open an Issue'
		}
	},
	settings: {
		title: 'Settings',
		close: 'Close Settings',
		restart: 'Requires Restart.',
		workflows: {
			title: 'Workflows'
		},
		commits: {
			title: 'Commits'
		},
		general: {
			title: 'General',
			language: {
				label: 'Language',
				description: 'Select the language you would like to use.'
			},
			editor: {
				label: 'External Editor',
				description: 'Select the editor you would like to use for opening files.',
				code: 'Visual Studio Code',
				subl: 'Sublime Text',
				'code-insiders': 'Visual Studio Code Insiders',
				atom: 'Atom'
			},
			commitStyle: {
				label: 'Commit Message Style',
				description:
					'Select the style of commit messages you would like to use. This only effects the currently selected repository',
				conventional: 'Conventional Commits',
				relational: 'Relational Commits',
				none: 'None'
			},
			enforceCommitStyle: {
				label: 'Enforce Commit Message Style',
				description:
					'This will prevent you from committing if your commit message does not match the style selected for a repository.'
			},
			preferParens: {
				label: 'Prefer Parentheses',
				description: 'Prefer parentheses over angle brackets for commit message styles.'
			}
		},
		appearance: {
			title: 'Appearance',
			vibrancy: {
				label: 'Vibrancy',
				description: 'Enable Under-Window Vibrancy. This may impact performance.'
			},
			theme: {
				label: 'Theme',
				description: 'Select the theme you would like to use.',
				light: 'Light',
				dark: 'Dark',
				system: 'System',
				systemNote: "The application's appearance will change based on OS preferences.",
				choose: 'Select {{theme}} theme'
			},
			font: {
				label: 'Custom Font',
				description:
					'This will override the default code font. You can use any font that is installed on your system.',
				placeholder: '"SF Mono", "IBM Plex Mono", "Fira Code", monospace'
			},
			clientThemes: {
				label: 'Client Themes',
				description: 'Pick user-made themes to use in the client.'
			}
		}
	},
	error: {
		corruptSettings: 'One or more of your configuration files are corrupt. Please reset them.',
		fetching: 'Unexpected error while fetching repository status',
		remote: 'Unexpected error while fetching remote status',
		git: 'Unexpected error while executing git command'
	},
	ui: {
		filepicker: {
			placeholder: 'Select a file...',
			folderPlaceholder: 'Select a folder...',
			label: 'Open file picker',
			valid: 'Valid Selection',
			notEmpty: '{{type}} is not empty',
			directory: ['Directory', 'Directories'],
			file: ['File', 'Files'],
			doesNotExist: '{{type}} does not exist',
			isNot: '{{type}} is not a {{expected}}'
		}
	},
	workspace: {
		commit: {
			open: 'Open {{hash}}'
		}
	},
	sidebar: {
		commit: {
			label: 'Open Commit {{hash}}'
		},
		drawer: {
			title: 'Repositories',
			contextMenu: {
				addRepository: 'Add Repository',
				createRepository: 'Create Repository',
				cloneFromGitHub: 'Clone from GitHub',
				viewIn: 'View in {{name}}',
				remove: 'Remove'
			},
			switchTo: 'Switch to {{name}}',
			openSettings: 'Open Settings',
			settings: 'Settings'
		},
		footer: {
			description: 'Description',
			summary: 'Summary',
			commit: 'Commit to {{branch}}',
			add: 'Add'
		},
		openDrawer: 'Open Repository Drawer',
		upToDate: "You're all up to date.",
		noCommits: 'No commits to show.',
		noRepo: 'No Repository Selected',
		noRepoHint: 'Select one to get started.',
		noBranch: 'No Branch',
		open: 'Open {{name}}',
		contextMenu: {
			stage: 'Stage Changes',
			unstage: 'Unstage Changes',
			stash: 'Stash Changes',
			unstash: 'Unstash Changes',
			discard: 'Discard Changes',
			ignore: 'Add to gitignore',
			ignoreExt: 'Add all .{{ext}} files to gitignore',
			viewIn: 'View in {{name}}',
			openIn: 'Open in {{name}}',
			openRemote: 'Open Remote'
		}
	},
	time: {
		second: ['{{count}} second', '{{count}} seconds'],
		minute: ['{{count}} minute', '{{count}} minutes'],
		hour: ['{{count}} hour', '{{count}} hours'],
		day: ['{{count}} day', '{{count}} days'],
		month: ['{{count}} month', '{{count}} months'],
		year: ['{{count}} year', '{{count}} years'],
		ago: 'ago',
		now: 'Just now'
	},
	codeview: {
		imageview: {
			error: 'Could not find an image to display',
			errorHint: 'This is probably because the image is too big to display.'
		},
		noCommit: 'Nothing to see here',
		noCommitHint: "You've got to select a file to see its changes. (´・｀)",
		binary: 'Binary file',
		binaryHint: "Sorry, we can't show you the diff for this file as it's a binary file.",
		loading: 'Loading...',
		loadingHint: "This shouldn't take too long.",
		errorHint: 'Something went wrong while loading the file.',
		noChanges: 'No pending changes!',
		noChangesHint: "Go take a break! You've earned it.",
		noFile: 'No files selected.',
		noFileHint: 'Click one in the sidebar over there （´・｀） to get started.',
		tooBig: 'Files too powerful!',
		tooBigHint: "This file is sooo huge that we aren't rendering it for performance reasons."
	},
	git: {
		hide: 'Hide',
		publish: 'Publish Branch',
		publishHint: 'Publish this branch to remote.',
		branches: ['Branch', 'Branches'],
		deleteBranch: 'Delete Branch',
		newBranch: 'New branch',
		createBranch: 'Create Branch',
		pushChanges: 'Push Changes',
		push: ['Push {{count}} change', 'Push {{count}} changes'],
		pullChanges: 'Pull Changes',
		pull: ['Pull {{count}} change', 'Pull {{count}} changes'],
		noChanges: 'No Changes',
		diverged: 'Trees have diverged',
		divergedHint: 'Stash changes and pull',
		nothingToSee: 'Nothing to see here',
		popStash: 'Pop Stash',
		commits: ['{{count}} commit', '{{count}} commits'],
		stashedChanges: ['{{count}} stashed change', '{{count}} stashed changes']
	},
	modal: {
		closeModal: 'Close Modal',
		confirm: 'Confirm',
		cancel: 'Cancel',
		close: 'Close',
		repository: {
			cancel: 'Cancel',
			add: 'Add',
			create: 'Create',
			addRepo: 'Add Repository',
			createRepo: 'Create Repository',
			notGit: 'Directory is not a Git Repository. Would you like to create one?'
		},
		reload: {
			title: 'Reload Client',
			message:
				'A setting has been changed that requires a reload. Would you like to reload now?'
		},
		error: {
			reload: 'Reload',
			reloadClient: 'Reload Client'
		},
		github: {
			title: 'Clone from ',
			back: 'Back',
			clone: 'Clone',
			backToSearch: 'Back to Search',
			search: 'Search',
			viewOnGithub: 'View on GitHub',
			searchPlaceholder: 'Enter a GitHub User or Organisation',
			loading: 'Loading...',
			loadingHint: 'Please wait while we fetch your repositories.',
			error: 'Oops! Something went wrong.',
			errorHint: 'We dropped the ball while trying to gather your repositories.'
		}
	}
};
