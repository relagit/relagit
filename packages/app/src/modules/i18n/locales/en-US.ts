export default {
	settings: {
		title: 'Settings',
		close: 'Close Settings',
		general: {
			title: 'General',
			language: {
				label: 'Language',
				description: 'Select the language you would like to use. Requires Restart.'
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
				description:
					'Enable Under-Window Vibrancy. This may impact performance. Requires Restart.'
			},
			theme: {
				label: 'Theme',
				description: 'Select the theme you would like to use.',
				light: 'Light',
				dark: 'Dark',
				system: 'System'
			},
			font: {
				label: 'Custom Font',
				description:
					'This will override the default code font. You can use any font that is installed on your system.',
				placeholder: '"SF Mono", "JetBrains Mono", "Fira Code", monospace'
			}
		}
	},
	error: {
		fetching: 'Unexpected error while fetching repository status',
		remote: 'Unexpected error while fetching remote status',
		git: 'Unexpected error while executing git command'
	},
	ui: {
		filepicker: {
			placeholder: 'Select a file...',
			label: 'Open file picker',
			valid: 'Valid Selection',
			directory: 'Directory',
			file: 'File',
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
				createGroup: 'Create Repository Group',
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
			commit: 'Commit to {{branch}}'
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
		noCommit: 'Nothing to see here',
		noCommitHint: "You've got to select a file to see its changes. (´・｀)",
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
		pushChanges: 'Push Changes',
		pullChanges: 'Pull Changes',
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
