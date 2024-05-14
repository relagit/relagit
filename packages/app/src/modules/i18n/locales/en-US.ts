export default {
	ai: {
		terms: {
			title: 'Generative AI Terms of Service',
			message:
				'Before you can use Generative features, you must accept the terms of service.',
			accept: 'Accept',
			decline: 'Decline'
		}
	},
	update: {
		download: 'Download',
		ignore: 'Ignore'
	},
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
			title: 'Git'
		},
		accounts: {
			title: 'Accounts',
			signIn: 'Sign In',
			signOut: 'Sign Out',
			github: 'GitHub',
			gitlab: 'GitLab',
			codeberg: 'Codeberg',
			url: '',
			keys: {
				access: 'View Repositories',
				refresh: 'Regenerate tokens',
				account: 'Access Account Details',
				none: 'No permissions granted'
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
				codium: 'VSCodium',
				subl: 'Sublime Text',
				'code-insiders': 'Visual Studio Code Insiders',
				atom: 'Atom',
				zed: 'Zed',
				fleet: 'Fleet',
				custom: 'Custom Editor',
				customPlaceholder: 'my-custom-editor --args'
			},
			commitStyle: {
				label: 'Commit Message Style',
				description:
					'Select the style of commit messages you would like to use. This only effects the currently selected repository',
				conventional: 'Conventional Commits',
				relational: 'Relational Commits',
				none: 'None'
			},
			cloneMethod: {
				label: 'Clone Method',
				description: 'Select the method you would like to use to clone repositories.',
				http: 'HTTP',
				httpHint: 'Recommended',
				ssh: 'SSH',
				sshHint: 'Requires you to have an SSH key set up with your provider.'
			},
			annotateCommit: {
				label: 'Annotate Commits',
				description:
					'Credit @relagit-client as the committer (not author) of your commits. This is a free way to give us some recognition!'
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
			},
			debug: {
				copy: 'Copy Debug Info'
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
				placeholder: 'SF Mono'
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
			autogenerate: 'Generate Commit Details',
			add: 'Add',
			dangerous:
				'You have staged files that may contain sensitive information. Please review your changes before committing.',
			committedBy: 'Will be authored by {{user}}'
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
			ignoreAll: 'Add all files to gitignore',
			ignoreExt: 'Add all .{{ext}} files to gitignore',
			selected: ['{{count}} selected file', '{{count}} selected files'],
			viewIn: 'View in {{name}}',
			openIn: 'Open in {{name}}',
			openRemote: 'Open Remote',
			copySha: 'Copy SHA',
			checkout: 'Checkout Commit',
			revert: 'Revert Commit',
			confirm: {
				discard: 'Bulk Discard',
				discardMessage: 'Are you sure you want to discard {{count}} changes?'
			}
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
		submodule: {
			title: 'Submodule Changes',
			cloned: 'Cloned to',
			from: 'Fetching changes from',
			revision: 'Submodule is on revision',
			clone: 'Clone Submodule',
			cloneHint: 'Clone this submodule from remote to commit changes to it directly.',
			clonedHint: 'This submodule is already cloned to your workspace.',
			open: 'Open {{name}}'
		},
		imageview: {
			error: 'Could not find an image to display',
			errorHint: 'This is probably because the image is too big to display.',
			sidebyside: 'Side by Side',
			difference: 'Difference'
		},
		renamed: 'File renamed without changes',
		renamedHint: 'This file had its name changed without any changes to its contents.',
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
	palette: {
		hint: [
			'Showing {{count}} of {{total}} repositoriy',
			'Showing {{count}} of {{total}} repositories'
		],
		empty: 'No repositories found.'
	},
	modal: {
		closeModal: 'Close Modal',
		confirm: 'Confirm',
		cancel: 'Cancel',
		close: 'Close',
		log: {
			title: 'Command Log'
		},
		providers: {
			title: 'Authentication Providers',
			hint: "Please select the provider you'd like to authenticate with."
		},
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
			commitsMonth: 'Commits per Month (Since {{month}}, {{year}})',
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
			notGit: 'Directory is not a Git Repository. Would you like to create one?',
			alreadyAdded: 'You already have {{name}} in your workspace.'
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
			title: 'Clone Repository',
			clone: 'Clone',
			search: 'Search',
			searchLabel: 'Search for a repository...',
			filter: 'Filter',
			loading: 'Loading...',
			loadingHint: 'Please wait while we fetch your repositories.',
			noRepos: 'No repositories found.',
			noReposHint: 'Try adding some repositories to your account.',
			noReposButton: 'Open in Browser',
			error: 'Oops! Something went wrong.',
			errorHint: 'We dropped the ball while trying to gather your repositories.',
			auth: 'You need to authenticate with a provider to view your repositories.',
			authHint: 'Click the button below to begin the OAuth process.',
			authButton: 'Authenticate',
			authenticated: 'Authenticated',
			authenticate: 'Authenticate via OAuth',
			urlLabel: 'Repository URL',
			urlPlaceholder: 'https://{{lc:provider}}.com/relagit/relagit',
			localLabel: 'Local Path',
			providers: {
				github: 'GitHub',
				gitlab: 'GitLab',
				codeberg: 'Codeberg',
				url: 'URL'
			}
		}
	}
} as const;
