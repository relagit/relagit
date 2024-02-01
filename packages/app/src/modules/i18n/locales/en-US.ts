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
			clone: 'View on GitHub',
			somethingWrong: 'Find something wrong?',
			issue: 'Open an Issue'
		}
	},
	settings: {
		title: 'Settings',
		close: 'Close Settings',
		restart: 'Requires Restart.',
		workflows: {
			title: 'Workflows',
			empty: {
				title: 'No Workflows',
				description: 'You do not have any workflows installed.',
				hint: 'Documentation'
			}
		},
		commits: {
			title: 'Commits'
		},
		accounts: {
			title: 'Accounts',
			github: {
				label: 'GitHub',
				note: 'Allow RelaGit to access private repositories and issues/pull requests.',
				signIn: 'Sign In',
				signOut: 'Sign Out'
			}
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
				atom: 'Atom',
				zed: 'Zed',
				fleet: 'Fleet'
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
			},
			autoFetch: {
				label: 'Auto Fetch Repositories',
				description:
					'Automatically fetch repositories on startup. Heavily impacts startup performance.'
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
			thinIcons: {
				label: 'Thin Icons',
				description: 'Use thinner icon variants in the header.'
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
		git: 'Unexpected error while executing git command',
		missingExternalEditor: 'RelaGit could not find your external editor in your PATH.'
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
				cloneRepository: 'Clone Repository',
				viewIn: 'View in {{name}}',
				remove: 'Remove',
				useWorkflow: 'Use as Workflow'
			},
			switchTo: 'Switch to {{name}}',
			openSettings: 'Open Settings',
			settings: 'Settings'
		},
		footer: {
			description: 'Description',
			summary: 'Summary',
			commit: 'Commit to {{branch}}',
			add: 'Add',
			dangerous:
				'You have staged files that may contain sensitive information. Please review your changes before committing.'
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
			openRemote: 'Open Remote',
			copySha: 'Copy SHA',
			checkout: 'Checkout Commit',
			revert: 'Revert Commit'
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
		in: 'in',
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
		sync: 'Sync',
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
		stashedChanges: ['{{stashCount}} stash ({{count}})', '{{stashCount}} stashes ({{count}})'],
		removeStash: 'Remove Stash',
		files: ['{{count}} file', '{{count}} files'],
		undo: 'Undo {{sha}}'
	},
	modal: {
		closeModal: 'Close Modal',
		confirm: 'Confirm',
		cancel: 'Cancel',
		close: 'Close',
		publish: {
			title: 'Publish Repository',
			name: 'Name',
			description: 'Description',
			descriptionPlaceholder: 'This is my cool new repository, it...',
			publish: 'Publish {{name}}',
			private: 'Keep this private',
			push: 'Push changes',
			owner: 'Owner',
			message: 'This repository will be published at {{url}}.',
			auth: 'You need to authenticate with GitHub to publish your repository.',
			authHint: 'Click the button below to begin the OAuth process.',
			authButton: 'Authenticate'
		},
		information: {
			metadata: 'Metadata',
			graph: 'Commit Graph',
			commitsMonth: 'Commits per Month',
			commitsInMonth: '{{count}} commits in {{month}}',
			gatheringInformation: 'Gathering Information to display...',
			items: {
				unknown: 'Unknown',
				diskPath: 'Path on Disk',
				diskSize: 'Disk Size',
				updated: 'Last Updated',
				remote: 'Remote URL'
			},
			month: {
				'0': 'January',
				'1': 'February',
				'2': 'March',
				'3': 'April',
				'4': 'May',
				'5': 'June',
				'6': 'July',
				'7': 'August',
				'8': 'September',
				'9': 'October',
				'10': 'November',
				'11': 'December'
			}
		},
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
		auth: {
			title: 'Complete Authentication',
			expired: 'Your verification code expire {{time}}. Please try again.',
			willExpire: 'Your verification code will expire {{time}}.',
			error: 'An error occurred while authenticating. Please try again.',
			success: 'Success! You may now close this modal.',
			copyCode: 'Copy Code',
			openInBrowser: 'Open in Browser'
		},
		clone: {
			title: 'Clone Repository ',
			back: 'Back',
			clone: 'Clone',
			backToSearch: 'Back to Search',
			search: 'Search',
			viewOnGithub: 'View on GitHub',
			searchPlaceholder: 'Enter a GitHub User or Organisation',
			searchPlaceholderVerified:
				'Enter a GitHub User or @me to search repositories you have access to',
			loading: 'Loading...',
			loadingHint: 'Please wait while we fetch your repositories.',
			error: 'Oops! Something went wrong.',
			errorHint: 'We dropped the ball while trying to gather your repositories.',
			auth: 'You need to authenticate with GitHub to view your repositories.',
			authHint: 'Click the button below to begin the OAuth process.',
			authButton: 'Authenticate',
			authenticated: 'Authenticated',
			authenticate: 'Authenticate via OAuth',
			github: 'GitHub.com',
			url: 'URL',
			urlLabel: 'Repository URL',
			urlPlaceholder: 'https://github.com/relagit/relagit',
			localLabel: 'Local Path'
		}
	}
} as const;
