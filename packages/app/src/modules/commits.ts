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
	const directories = files.map((file: string) => file.split('/'));

	let out = '';

	for (let i = 0; i < directories[0].length; i++) {
		const directory = directories[0][i];
		if (
			directories.every((directoryList: string[]) => {
				const current = directoryList[i];

				return (
					current === directory &&
					!['node_modules', 'packages', 'app', 'src', 'lib'].includes(current)
				);
			})
		) {
			out += `${directory}/`;
		}
	}

	return out.endsWith('/') ? out.slice(0, -1) : out;
};

export const getCommitStyledMessage = (
	commit: IDraftCommit,
	style?: CommitStyle,
	parens?: boolean,
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
				message: `${parens ? '(' : '['}${scope}${parens ? ')' : ']'} ${
					type ? `${type}: ` : ''
				}`,
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
