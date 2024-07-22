export default {
	ai: {
		terms: {
			title: '生成AI服务条款',
			message: '在使用生成功能之前，您必须接受服务条款。',
			accept: '接受',
			decline: '拒绝'
		},
		error: {
			title: '初始化AI时出错',
			message: '初始化AI服务时出错，请检查您的设置。'
		}
	},
	update: {
		download: '下载',
		ignore: '忽略'
	},
	onboarding: {
		takeTour: '开始导览',
		next: '下一步',
		dismiss: '关闭',
		version: '版本 {{version}}',
		header: {
			tooltip: '从存储库选择器中添加您的存储库。'
		},
		add: {
			tooltip: '使用此文件选择器从设备中添加存储库。',
			button: '现在将其添加到您的工作区。'
		},
		history: {
			tooltip: '从这里，您可以查看提交历史记录。'
		},
		modal: {
			title: '下一步',
			themes: '浏览客户端主题',
			workflows: '浏览工作流程',
			clone: '在GitHub上查看',
			somethingWrong: '发现问题了吗？',
			issue: '提交问题'
		}
	},
	settings: {
		title: '设置',
		close: '关闭设置',
		restart: '需要重新启动。',
		workflows: {
			title: '工作流程',
			empty: {
				title: '没有工作流程',
				description: '您没有安装任何工作流程。',
				hint: '文档'
			}
		},
		commits: {
			title: 'Git'
		},
		ai: {
			title: 'AI',
			model: {
				label: '语言模型',
				description: '选择您想要使用的语言模型。',
				none: '无',
				noneHint: '禁用所有AI功能',
				openai: 'OpenAI',
				gemini: 'Google Gemini',
				anthropic: 'Anthropic',
				'gpt-3-5': 'GPT 3.5 Turbo',
				'gpt-4': 'GPT 4 Turbo',
				'gpt-4o': 'GPT 4o',
				'gemini-pro': 'Gemini Pro',
				'gemini-1-5-pro': 'Gemini 1.5 Pro',
				'claude-haiku': 'Claude 3 Haiku',
				'claude-sonnet': 'Claude 3 Sonnet',
				'claude-opus': 'Claude 3 Opus'
			},
			apiKey: {
				label: 'API密钥',
				description: '输入您的{{provider}}的API密钥。',
				selected: '您选择的提供商',
				placeholder: '123456789012345678901234567-1234567890'
			}
		},
		accounts: {
			title: '账户',
			signIn: '登录',
			signOut: '退出登录',
			github: 'GitHub',
			gitlab: 'GitLab',
			codeberg: 'Codeberg',
			url: '',
			keys: {
				access: '查看存储库',
				refresh: '重新生成令牌',
				account: '访问账户详情',
				none: '未授予任何权限'
			}
		},
		general: {
			title: '常规',
			language: {
				label: '语言',
				description: '选择您想要使用的语言。'
			},
			editor: {
				label: '外部编辑器',
				description: '选择您想要用于打开文件的编辑器。',
				code: 'Visual Studio Code',
				codium: 'VSCodium',
				subl: 'Sublime Text',
				'code-insiders': 'Visual Studio Code Insiders',
				atom: 'Atom',
				zed: 'Zed',
				fleet: 'Fleet',
				custom: '自定义编辑器',
				customPlaceholder: 'my-custom-editor --args'
			},
			commitStyle: {
				label: '提交消息样式',
				description: '选择您想要使用的提交消息样式。这仅影响当前选择的存储库',
				conventional: '常规提交',
				relational: '关系提交',
				none: '无'
			},
			cloneMethod: {
				label: '克隆方法',
				description: '选择您想要使用的克隆存储库的方法。',
				http: 'HTTP',
				httpHint: '推荐',
				ssh: 'SSH',
				sshHint: '需要您在提供商处设置SSH密钥。'
			},
			annotateCommit: {
				label: '注释提交',
				description:
					'将@relagit-client作为提交者（而不是作者）标记您的提交。这是一种免费的方式为我们提供一些认可！'
			},
			enforceCommitStyle: {
				label: '强制提交消息样式',
				description: '如果您的提交消息与存储库选择的样式不匹配，将阻止您进行提交。'
			},
			preferParens: {
				label: '优先使用括号',
				description: '在提交消息样式中优先使用括号而不是尖括号。'
			},
			autoFetch: {
				label: '自动获取存储库',
				description: '在启动时自动获取存储库。对启动性能有很大影响。'
			},
			debug: {
				copy: '复制调试信息'
			}
		},
		appearance: {
			title: '外观',
			vibrancy: {
				label: '窗口透明效果',
				description: '启用窗口下的透明效果。这可能会影响性能。'
			},
			theme: {
				label: '主题',
				description: '选择您想要使用的主题。',
				light: '明亮',
				dark: '暗黑',
				system: '系统',
				systemNote: '应用程序的外观将根据操作系统的首选项而改变。',
				choose: '选择{{theme}}主题'
			},
			font: {
				label: '自定义字体',
				description: '这将覆盖默认的代码字体。您可以使用系统上安装的任何字体。',
				placeholder: 'SF Mono'
			},
			thinIcons: {
				label: '细线图标',
				description: '在标题中使用更细的图标变体。'
			},
			clientThemes: {
				label: '客户端主题',
				description: '选择要在客户端中使用的用户制作的主题。'
			}
		}
	},
	error: {
		corruptSettings: '一个或多个配置文件损坏。请重置它们。',
		fetching: '获取存储库状态时发生意外错误',
		remote: '获取远程状态时发生意外错误',
		git: '无法运行Git命令',
		missingExternalEditor: 'RelaGit无法在PATH中找到您的外部编辑器。'
	},
	ui: {
		filepicker: {
			placeholder: '选择文件...',
			folderPlaceholder: '选择文件夹...',
			label: '打开文件选择器',
			valid: '有效选择',
			notEmpty: '{{type}}不为空',
			directory: ['目录', '目录'],
			file: ['文件', '文件'],
			doesNotExist: '{{type}}不存在',
			isNot: '{{type}}不是{{expected}}'
		}
	},
	workspace: {
		commit: {
			open: '打开{{hash}}'
		}
	},
	sidebar: {
		commit: {
			label: '打开提交{{hash}}'
		},
		drawer: {
			title: '搜索存储库...',
			contextMenu: {
				addRepository: '添加存储库',
				createRepository: '创建存储库',
				cloneRepository: '克隆存储库',
				viewIn: '在{{name}}中查看',
				remove: '移除',
				useWorkflow: '用作工作流程'
			},
			switchTo: '切换到{{name}}',
			openSettings: '打开设置',
			settings: '设置'
		},
		footer: {
			description: '描述',
			summary: '摘要',
			commit: '提交到{{branch}}',
			autogenerate: '生成提交详情',
			add: '添加',
			dangerous: '您已暂存可能包含敏感信息的文件。请在提交之前检查您的更改。',
			committedBy: '将由{{user}}撰写'
		},
		openDrawer: '打开存储库抽屉',
		upToDate: '您已经是最新的。',
		noCommits: '没有要显示的提交。',
		noRepo: '未选择存储库',
		noRepoHint: '选择一个存储库开始。',
		noBranch: '无分支',
		open: '打开{{name}}',
		contextMenu: {
			stage: '暂存更改',
			unstage: '取消暂存更改',
			stash: '储藏更改',
			unstash: '取消储藏更改',
			discard: '放弃更改',
			ignore: '添加到.gitignore',
			ignoreAll: '将所有文件添加到.gitignore',
			ignoreExt: '将所有.{{ext}}文件添加到.gitignore',
			selected: ['{{count}}个选定的文件', '{{count}}个选定的文件'],
			viewIn: '在{{name}}中查看',
			openIn: '在{{name}}中打开',
			openRemote: '打开远程',
			copySha: '复制SHA',
			checkout: '切换到提交',
			revert: '还原提交',
			confirm: {
				discard: '批量放弃',
				discardMessage: '您确定要放弃{{count}}个更改吗？'
			}
		}
	},
	time: {
		second: ['{{count}}秒', '{{count}}秒'],
		minute: ['{{count}}分钟', '{{count}}分钟'],
		hour: ['{{count}}小时', '{{count}}小时'],
		day: ['{{count}}天', '{{count}}天'],
		month: ['{{count}}个月', '{{count}}个月'],
		year: ['{{count}}年', '{{count}}年'],
		ago: '前',
		in: '后',
		now: '刚刚'
	},
	codeview: {
		submodule: {
			title: '子模块更改',
			cloned: '克隆到',
			from: '从{{branch}}获取更改',
			revision: '子模块处于修订版本',
			clone: '克隆子模块',
			cloneHint: '从远程克隆此子模块以直接提交更改。',
			clonedHint: '此子模块已经克隆到您的工作区。',
			open: '打开{{name}}'
		},
		imageview: {
			error: '找不到要显示的图像',
			errorHint: '这可能是因为图像太大而无法显示。',
			sidebyside: '并排显示',
			difference: '差异'
		},
		renamed: '文件重命名但无更改',
		renamedHint: '此文件的名称已更改，但其内容没有任何更改。',
		noCommit: '这里没有任何内容',
		noCommitHint: '您必须选择一个文件才能查看其更改。（´・｀）',
		binary: '二进制文件',
		binaryHint: '抱歉，我们无法为此二进制文件显示差异，因为它是一个二进制文件。',
		loading: '加载中...',
		loadingHint: '这应该不会花费太长时间。',
		errorHint: '加载文件时出现问题。',
		noChanges: '没有待处理的更改',
		noChangesHint: '休息一下！您值得拥有。',
		noFile: '未选择文件。',
		noFileHint: '点击侧边栏中的一个文件开始。',
		tooBig: '文件太强大了！',
		tooBigHint: '由于性能原因，我们不会渲染此文件。'
	},
	git: {
		sync: '同步',
		hide: '隐藏',
		publish: '发布分支',
		publishHint: '将此分支发布到远程。',
		branches: ['分支', '分支'],
		deleteBranch: '删除分支',
		mergeBranch: '将{{branch}}合并到{{current}}',
		cherryPick: '从{{branch}}合并到{{current}}',
		newBranch: '新分支',
		createBranch: '创建分支',
		pushChanges: '推送更改',
		push: ['推送{{count}}个更改', '推送{{count}}个更改'],
		pullChanges: '拉取更改',
		pull: ['拉取{{count}}个更改', '拉取{{count}}个更改'],
		noChanges: '没有更改',
		diverged: '树已分叉',
		divergedHint: '储藏更改并拉取',
		nothingToSee: '这里没有任何内容',
		popStash: '弹出储藏',
		commits: ['{{count}}个提交', '{{count}}个提交'],
		stashedChanges: [
			'{{stashCount}}个储藏（{{count}}个）',
			'{{stashCount}}个储藏（{{count}}个）'
		],
		removeStash: '删除储藏',
		files: ['{{count}}个文件', '{{count}}个文件'],
		undo: '撤销{{sha}}',
		remote: {
			view: '查看{{name}}',
			issue: ['问题', '问题'],
			pull: ['拉取请求', '拉取请求']
		}
	},
	palette: {
		hint: ['显示{{total}}个存储库中的{{count}}个', '显示{{total}}个存储库中的{{count}}个'],
		empty: '未找到存储库。'
	},
	modal: {
		closeModal: '关闭模态框',
		confirm: '确认',
		cancel: '取消',
		close: '关闭',
		log: {
			title: '命令日志'
		},
		providers: {
			title: '身份验证提供商',
			hint: '请选择您要使用的身份验证提供商。'
		},
		publish: {
			title: '发布存储库',
			name: '名称',
			description: '描述',
			descriptionPlaceholder: '这是我的酷炫新存储库，它...',
			publish: '发布{{name}}',
			private: '保持私有',
			push: '推送更改',
			owner: '所有者',
			message: '此存储库将发布在{{url}}。',
			auth: '您需要使用GitHub进行身份验证才能发布您的存储库。',
			authHint: '点击下面的按钮开始OAuth过程。',
			authButton: '进行身份验证'
		},
		cherryPick: {
			title: '从{{branch}}合并到{{current}}',
			noCommits: '没有要合并的提交',
			noCommitsHint: '{{branch}}中没有任何提交不在{{current}}中。',
			action: '合并'
		},
		information: {
			metadata: '元数据',
			graph: '提交图',
			commitsMonth: '每月提交次数（自{{month}}年{{year}}月起）',
			commitsInMonth: '{{month}}中有{{count}}个提交',
			gatheringInformation: '正在收集要显示的信息...',
			items: {
				unknown: '未知',
				diskPath: '磁盘路径',
				diskSize: '磁盘大小',
				updated: '上次更新',
				remote: '远程URL'
			},
			month: {
				'0': '一月',
				'1': '二月',
				'2': '三月',
				'3': '四月',
				'4': '五月',
				'5': '六月',
				'6': '七月',
				'7': '八月',
				'8': '九月',
				'9': '十月',
				'10': '十一月',
				'11': '十二月'
			}
		},
		repository: {
			cancel: '取消',
			add: '添加',
			create: '创建',
			addRepo: '添加存储库',
			createRepo: '创建存储库',
			notGit: '目录不是Git存储库。您想要创建一个吗？',
			alreadyAdded: '您的工作区中已经有{{name}}。'
		},
		reload: {
			title: '重新加载',
			message: '已更改设置，需要重新加载。您想现在重新加载吗？'
		},
		error: {
			reload: '重新加载',
			reloadClient: '重新加载客户端'
		},
		auth: {
			title: '完成认证',
			expired: '您的验证码已于 {{time}} 过期。请再试一次。',
			willExpire: '您的验证码将于 {{time}} 过期。',
			error: '认证时发生错误。请再试一次。',
			success: '成功！您现在可以关闭这个模态框。',
			copyCode: '复制代码',
			openInBrowser: '在浏览器中打开'
		},
		clone: {
			title: '克隆仓库',
			clone: '克隆',
			search: '搜索',
			searchLabel: '搜索仓库...',
			filter: '过滤',
			loading: '加载中...',
			loadingHint: '请等待，我们正在获取您的仓库。',
			noRepos: '未找到仓库。',
			noReposHint: '尝试向您的账户添加一些仓库。',
			noReposButton: '在浏览器中打开',
			error: '哎呀！出了些问题。',
			errorHint: '我们在尝试收集您的仓库时出了点问题。',
			auth: '您需要通过提供者进行认证，以查看您的仓库。',
			authHint: '点击下面的按钮开始 OAuth 过程。',
			authButton: '认证',
			authenticated: '已认证',
			authenticate: '通过 OAuth 认证',
			urlLabel: '仓库 URL',
			urlPlaceholder: 'https://{{lc:provider}}.com/relagit/relagit',
			localLabel: '本地路径',
			providers: {
				github: 'GitHub',
				gitlab: 'GitLab',
				codeberg: 'Codeberg',
				url: 'URL'
			}
		}
	}
} as const;
