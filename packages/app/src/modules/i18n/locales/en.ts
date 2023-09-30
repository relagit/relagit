export default {
	sidebar: {
		upToDate: "You're all up to date.",
		noCommits: 'No commits to show.',
		noRepo: 'No Repository Selected',
		noRepoHint: 'Select one to get started.',
		noBranch: 'No Branch',
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
