export enum CommitStyle {
	conventional = 'conventional',
	relational = 'relational',
	none = 'none'
}

// temporary
export interface IDraftCommit {
	files: string[];
}

export interface ICommit {
	message: string;
	description: string;
	files: string[];
}

const getScope = (files: string[]): string => {
	if (!files.length) return;

	const levels = files.map((file) => file.split('/'));

	let scope = levels[0][0];

	for (let i = 1; i < levels.length; i++) {
		if (levels[i][0] !== scope) return '';
	}

	if (['node_modules', 'packages', 'app', 'src'].includes(scope)) {
		scope = levels[0][1];
	}

	return scope;
};

export const getCommitStyledMessage = (
	commit: IDraftCommit,
	style?: CommitStyle,
	type?: string
): ICommit => {
	if (!commit.files?.length) return;

	const scope = getScope(commit.files);

	if (!style)
		return {
			message: '',
			description: '',
			files: commit.files
		};

	if (!scope) return;

	switch (style) {
		case CommitStyle.conventional:
			return {
				message: `${type ? `${type}(` : ''}${scope}${type ? '): ' : ':'} `,
				description: '',
				files: commit.files
			};
		case CommitStyle.relational:
			return {
				message: `[${scope}] ${type ? `${type}: ` : ''}`,
				description: '',
				files: commit.files
			};
	}
};

const CONVENTIONAL_REGEX = /^(?<type>\w+)(\((?<scope>\w+)\))?: (?<message>.+)$/;
const RELATIONAL_REGEX = /^\[(?<scope>.+)\] (?:(?<type>.+): )?(?<message>.+)$/;

export const validateCommitMessage = (message: string, style?: CommitStyle): boolean => {
	switch (style) {
		case CommitStyle.conventional:
			return CONVENTIONAL_REGEX.test(message);

		case CommitStyle.relational:
			return RELATIONAL_REGEX.test(message);
	}
};
