const path = window.Native.DANGEROUS__NODE__REQUIRE('path') as typeof import('path');

import { createStoreListener } from '@stores/index';
import LocationStore from '@stores/location';

import Header from '@ui/Workspace/Header';
import CodeView from './CodeView';

import './index.scss';

export interface IWorkspaceProps {
	sidebar: boolean;
}

export default (props: IWorkspaceProps) => {
	const repo = createStoreListener([LocationStore], () => LocationStore.selectedRepository?.path);
	const file = createStoreListener([LocationStore], () => {
		const repo = LocationStore.selectedRepository;
		const file = LocationStore.selectedFile;

		return {
			file: file,
			path: file && repo ? path.join(repo.path, file.path, file.name) : undefined
		};
	});

	return (
		<div classList={{ workspace: true, 'sidebar-active': props.sidebar }}>
			<Header />
			<div class="workspace__file">
				<div class="workspace__file__path">{file().file?.path}/</div>
				<div class="workspace__file__name">{file().file?.name}</div>
			</div>
			<CodeView file={file().path} repository={repo()} />
		</div>
	);
};
