export interface CodebergUser {
	active: boolean;
	avatar_url: string;
	created: string;
	description: string;
	email: string;
	followers_count: number;
	following_count: number;
	full_name: string;
	id: number;
	is_admin: boolean;
	language: string;
	last_login: string;
	location: string;
	login: string;
	login_name: string;
	prohibit_login: boolean;
	restricted: boolean;
	starred_repos_count: number;
	username: string;
	visibility: string;
	website: string;
}

export interface CodebergRepository {
	allow_merge_commits: boolean;
	allow_rebase: boolean;
	allow_rebase_explicit: boolean;
	allow_rebase_update: boolean;
	allow_squash_merge: boolean;
	archived: boolean;
	archived_at: string;
	avatar_url: string;
	clone_url: string;
	created_at: string;
	default_allow_maintainer_edit: boolean;
	default_branch: string;
	default_delete_branch_after_merge: boolean;
	default_merge_style: string;
	description: string;
	empty: boolean;
	external_tracker: {
		external_tracker_format: string;
		external_tracker_regexp_pattern: string;
		external_tracker_style: string;
		external_tracker_url: string;
	};
	external_wiki: {
		external_wiki_url: string;
	};
	fork: boolean;
	forks_count: number;
	full_name: string;
	has_actions: boolean;
	has_issues: boolean;
	has_packages: boolean;
	has_projects: boolean;
	has_pull_requests: boolean;
	has_releases: boolean;
	has_wiki: boolean;
	html_url: string;
	id: number;
	ignore_whitespace_conflicts: boolean;
	internal: boolean;
	internal_tracker: {
		allow_only_contributors_to_track_time: boolean;
		enable_issue_dependencies: boolean;
		enable_time_tracker: boolean;
	};
	language: string;
	languages_url: string;
	link: string;
	mirror: boolean;
	mirror_interval: string;
	mirror_updated: string;
	name: string;
	open_issues_count: number;
	open_pr_counter: number;
	original_url: string;
	owner: CodebergUser;
	permissions: {
		admin: boolean;
		pull: boolean;
		push: boolean;
	};
	private: boolean;
	release_counter: number;
	repo_transfer: object;
	size: number;
	ssh_url: string;
	stars_count: number;
	template: boolean;
	updated_at: string;
	url: string;
	watchers_count: number;
	website: string;
}

export interface CodebergResponse {
	user: [[], CodebergUser];
	'user/repos': [[], CodebergRepository[]];
}
