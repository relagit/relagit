export default {
	ai: {
		terms: {
			title: '생성형 AI 서비스 약관',
			message: '생성형 기능을 사용하려면 서비스 약관에 동의해야 합니다.',
			accept: '동의',
			decline: '거부'
		},
		error: {
			title: 'AI 초기화 중 오류 발생',
			message: 'AI 서비스를 초기화하는 중 오류가 발생했습니다. 설정을 확인해 주세요.'
		}
	},
	update: {
		download: '다운로드',
		ignore: '무시'
	},
	onboarding: {
		takeTour: '둘러보기 시작',
		next: '다음',
		dismiss: '닫기',
		version: '버전 {{version}}',
		header: {
			tooltip: '저장소 선택기에서 저장소를 추가하세요.'
		},
		add: {
			tooltip: '이 파일 선택기를 사용해 기기에서 저장소를 추가하세요.',
			button: '이제 작업 공간에 추가하세요.'
		},
		history: {
			tooltip: '여기에서 커밋 기록을 확인할 수 있습니다.'
		},
		modal: {
			title: '다음 단계',
			themes: '클라이언트 테마 둘러보기',
			workflows: '워크플로 둘러보기',
			clone: 'GitHub에서 보기',
			somethingWrong: '문제를 발견하셨나요?',
			issue: '이슈 등록하기'
		}
	},
	settings: {
		title: '설정',
		close: '설정 닫기',
		restart: '재시작이 필요합니다.',
		workflows: {
			title: '워크플로',
			empty: {
				title: '워크플로 없음',
				description: '설치된 워크플로가 없습니다.',
				hint: '문서'
			}
		},
		commits: {
			title: 'Git'
		},
		ai: {
			title: 'AI',
			model: {
				label: '언어 모델',
				description: '사용할 언어 모델을 선택하세요.',
				none: '없음',
				noneHint: '모든 AI 기능을 비활성화합니다',
				openai: 'OpenAI',
				gemini: 'Google Gemini',
				anthropic: 'Anthropic',
				'gpt-3-5': 'GPT 3.5 Turbo',
				'gpt-4': 'GPT 4 Turbo',
				'gpt-4o': 'GPT 4o',
				'gemini-pro': 'Gemini Pro',
				'gemini-1-5-pro': 'Gemini 1.5 Pro',
				'claude-haiku': 'Claude 3 Haiku',
				'claude-sonnet': 'Claude 3.5 Sonnet',
				'claude-opus': 'Claude 3 Opus'
			},
			apiKey: {
				label: 'API 키',
				description: '{{provider}}의 API 키를 입력하세요.',
				selected: '선택한 제공자',
				placeholder: '123456789012345678901234567-1234567890'
			}
		},
		accounts: {
			title: '계정',
			signIn: '로그인',
			signOut: '로그아웃',
			github: 'GitHub',
			gitlab: 'GitLab',
			codeberg: 'Codeberg',
			url: '',
			keys: {
				access: '저장소 보기',
				refresh: '토큰 재생성',
				account: '계정 세부정보 접근',
				none: '부여된 권한 없음'
			}
		},
		general: {
			title: '일반',
			language: {
				label: '언어',
				description: '사용할 언어를 선택하세요.'
			},
			editor: {
				label: '외부 편집기',
				description: '파일을 열 때 사용할 편집기를 선택하세요.',
				code: 'Visual Studio Code',
				codium: 'VSCodium',
				subl: 'Sublime Text',
				'code-insiders': 'Visual Studio Code Insiders',
				atom: 'Atom',
				zed: 'Zed',
				fleet: 'Fleet',
				custom: '사용자 지정 편집기',
				customPlaceholder: 'my-custom-editor --args'
			},
			commitStyle: {
				label: '커밋 메시지 스타일',
				description:
					'사용할 커밋 메시지 스타일을 선택하세요. 현재 선택된 저장소에만 적용됩니다',
				conventional: 'Conventional Commits',
				relational: 'Relational Commits',
				none: '없음'
			},
			cloneMethod: {
				label: '클론 방식',
				description: '저장소를 클론할 때 사용할 방식을 선택하세요.',
				http: 'HTTP',
				httpHint: '권장',
				ssh: 'SSH',
				sshHint: '제공자에 SSH 키가 설정되어 있어야 합니다.'
			},
			annotateCommit: {
				label: '커밋에 주석 달기',
				description:
					'커밋의 작성자(author)가 아닌 커미터(committer)로 @relagit-client를 표시합니다. 저희에게 인정을 표할 수 있는 무료 방법입니다!'
			},
			enforceCommitStyle: {
				label: '커밋 메시지 스타일 강제',
				description:
					'저장소에 선택된 스타일과 커밋 메시지가 일치하지 않으면 커밋을 할 수 없습니다.'
			},
			preferParens: {
				label: '괄호 선호',
				description: '커밋 메시지 스타일에서 꺾쇠괄호 대신 괄호를 선호합니다.'
			},
			autoFetch: {
				label: '저장소 자동 가져오기',
				description: '시작 시 저장소를 자동으로 가져옵니다. 시작 성능에 큰 영향을 줍니다.'
			},
			debug: {
				copy: '디버그 정보 복사'
			},
			telemetry: {
				metrics: {
					label: '익명 사용 데이터 보고',
					description:
						'클라이언트 개선을 위해 익명의 사용 데이터를 전송합니다. 개인 정보는 절대 전송되지 않습니다.'
				}
			}
		},
		appearance: {
			title: '모양',
			vibrancy: {
				label: '비비런시(Vibrancy)',
				description: '창 아래 비비런시 효과를 활성화합니다. 성능에 영향을 줄 수 있습니다.'
			},
			theme: {
				label: '테마',
				description: '사용할 테마를 선택하세요.',
				light: '라이트',
				dark: '다크',
				system: '시스템',
				systemNote: '앱의 모양이 OS 설정에 따라 변경됩니다.',
				choose: '{{theme}} 테마 선택'
			},
			font: {
				label: '사용자 지정 글꼴',
				description:
					'기본 코드 글꼴을 재정의합니다. 시스템에 설치된 어떤 글꼴이든 사용할 수 있습니다.',
				placeholder: 'SF Mono'
			},
			thinIcons: {
				label: '얇은 아이콘',
				description: '헤더에 더 얇은 아이콘을 사용합니다.'
			},
			clientThemes: {
				label: '클라이언트 테마',
				description: '클라이언트에서 사용할 사용자 제작 테마를 선택하세요.'
			}
		}
	},
	error: {
		corruptSettings: '하나 이상의 설정 파일이 손상되었습니다. 초기화해 주세요.',
		fetching: '저장소 상태를 가져오는 중 예기치 않은 오류 발생',
		remote: '원격 상태를 가져오는 중 예기치 않은 오류 발생',
		git: 'Git 명령을 실행할 수 없습니다',
		missingExternalEditor: 'RelaGit이 PATH에서 외부 편집기를 찾을 수 없습니다.'
	},
	ui: {
		filepicker: {
			placeholder: '파일 선택...',
			folderPlaceholder: '폴더 선택...',
			label: '파일 선택기 열기',
			valid: '올바른 선택',
			notEmpty: '{{type}}이(가) 비어 있지 않습니다',
			directory: ['디렉터리', '디렉터리'],
			file: ['파일', '파일'],
			doesNotExist: '{{type}}이(가) 존재하지 않습니다',
			isNot: '{{type}}이(가) {{expected}}이(가) 아닙니다'
		}
	},
	workspace: {
		commit: {
			open: '{{hash}} 열기'
		}
	},
	sidebar: {
		commit: {
			label: '커밋 {{hash}} 열기'
		},
		drawer: {
			title: '저장소 검색...',
			empty: '저장소를 찾을 수 없습니다.',
			contextMenu: {
				addRepository: '저장소 추가',
				createRepository: '저장소 생성',
				cloneRepository: '저장소 클론',
				viewIn: '{{name}}에서 보기',
				remove: '제거',
				useWorkflow: '워크플로로 사용'
			},
			switchTo: '{{name}}(으)로 전환',
			openSettings: '설정 열기',
			settings: '설정'
		},
		footer: {
			description: '설명',
			summary: '요약',
			commit: '{{branch}}에 커밋',
			autogenerate: '커밋 세부정보 생성',
			add: '추가',
			dangerous:
				'민감한 정보가 포함되었을 수 있는 파일이 스테이징되어 있습니다. 커밋하기 전에 변경사항을 검토해 주세요.',
			committedBy: '{{user}}이(가) 작성자로 기록됩니다'
		},
		openDrawer: '저장소 서랍 열기',
		upToDate: '모두 최신 상태입니다.',
		noCommits: '표시할 커밋이 없습니다.',
		noRepo: '선택된 저장소 없음',
		noRepoHint: '시작하려면 하나를 선택하세요.',
		noBranch: '브랜치 없음',
		open: '{{name}} 열기',
		contextMenu: {
			stage: '변경사항 스테이징',
			unstage: '스테이징 취소',
			stash: '변경사항 스태시',
			unstash: '스태시 적용',
			discard: '변경사항 폐기',
			ignore: 'gitignore에 추가',
			ignoreAll: '모든 파일을 gitignore에 추가',
			ignoreExt: '모든 .{{ext}} 파일을 gitignore에 추가',
			selected: ['선택한 파일 {{count}}개', '선택한 파일 {{count}}개'],
			viewIn: '{{name}}에서 보기',
			openIn: '{{name}}에서 열기',
			openRemote: '원격 저장소 열기',
			copySha: 'SHA 복사',
			checkout: '커밋 체크아웃',
			revert: '커밋 되돌리기',
			confirm: {
				discard: '일괄 폐기',
				discardMessage: '변경사항 {{count}}개를 폐기하시겠습니까?'
			}
		}
	},
	time: {
		second: ['{{count}}초', '{{count}}초'],
		minute: ['{{count}}분', '{{count}}분'],
		hour: ['{{count}}시간', '{{count}}시간'],
		day: ['{{count}}일', '{{count}}일'],
		month: ['{{count}}개월', '{{count}}개월'],
		year: ['{{count}}년', '{{count}}년'],
		ago: '전',
		in: '후',
		now: '방금 전'
	},
	codeview: {
		submodule: {
			title: '서브모듈 변경사항',
			cloned: '클론 위치',
			from: '변경사항 가져오는 중',
			revision: '서브모듈 리비전',
			clone: '서브모듈 클론',
			cloneHint: '이 서브모듈을 원격에서 클론하여 변경사항을 직접 커밋하세요.',
			clonedHint: '이 서브모듈은 이미 작업 공간에 클론되어 있습니다.',
			open: '{{name}} 열기'
		},
		imageview: {
			error: '표시할 이미지를 찾을 수 없습니다',
			errorHint: '이미지가 너무 커서 표시할 수 없는 것 같습니다.',
			sidebyside: '나란히 보기',
			difference: '차이점'
		},
		renamed: '변경 없이 이름이 변경된 파일',
		renamedHint: '이 파일은 내용 변경 없이 이름만 변경되었습니다.',
		noCommit: '표시할 내용이 없습니다',
		noCommitHint: '변경사항을 보려면 파일을 선택해야 합니다. (´・｀)',
		binary: '바이너리 파일',
		binaryHint: '죄송합니다. 바이너리 파일이라 diff를 표시할 수 없습니다.',
		loading: '불러오는 중...',
		loadingHint: '오래 걸리지 않을 거예요.',
		errorHint: '파일을 불러오는 중 문제가 발생했습니다.',
		noChanges: '대기 중인 변경사항 없음',
		noChangesHint: '잠시 쉬어가세요! 그럴 자격이 있어요.',
		noFile: '선택된 파일이 없습니다.',
		noFileHint: '시작하려면 저기 사이드바에서 하나를 클릭하세요 （´・｀）.',
		tooBig: '파일이 너무 강력해요!',
		tooBigHint: '이 파일이 너무 커서 성능상의 이유로 렌더링하지 않습니다.'
	},
	git: {
		sync: '동기화',
		hide: '숨기기',
		publish: '브랜치 게시',
		publishHint: '이 브랜치를 원격에 게시합니다.',
		branches: ['브랜치', '브랜치'],
		deleteBranch: '브랜치 삭제',
		mergeBranch: '{{branch}}을(를) {{current}}에 병합',
		cherryPick: '{{branch}}에서 {{current}}(으)로 체리픽',
		searchBranches: '브랜치 검색...',
		newBranch: '새 브랜치',
		createBranch: '브랜치 생성',
		pushChanges: '변경사항 푸시',
		push: ['변경사항 {{count}}개 푸시', '변경사항 {{count}}개 푸시'],
		pullChanges: '변경사항 풀',
		pull: ['변경사항 {{count}}개 풀', '변경사항 {{count}}개 풀'],
		noChanges: '변경사항 없음',
		diverged: '트리가 분기되었습니다',
		divergedHint: '변경사항을 스태시하고 풀하세요',
		nothingToSee: '표시할 내용이 없습니다',
		popStash: '스태시 팝',
		commits: ['커밋 {{count}}개', '커밋 {{count}}개'],
		stashedChanges: [
			'스태시 {{stashCount}}개 ({{count}})',
			'스태시 {{stashCount}}개 ({{count}})'
		],
		removeStash: '스태시 제거',
		files: ['파일 {{count}}개', '파일 {{count}}개'],
		undo: '{{sha}} 실행 취소',
		remote: {
			view: '{{name}} 보기',
			issue: ['이슈', '이슈'],
			pull: ['풀 리퀘스트', '풀 리퀘스트']
		}
	},
	palette: {
		hint: [
			'{{total}}개 중 {{count}}개 저장소 표시 중',
			'{{total}}개 중 {{count}}개 저장소 표시 중'
		],
		empty: '저장소를 찾을 수 없습니다.'
	},
	modal: {
		closeModal: '모달 닫기',
		confirm: '확인',
		cancel: '취소',
		close: '닫기',
		log: {
			title: '명령어 로그'
		},
		providers: {
			title: '인증 제공자',
			hint: '인증할 제공자를 선택하세요.'
		},
		publish: {
			title: '저장소 게시',
			name: '이름',
			description: '설명',
			descriptionPlaceholder: '이것은 저의 멋진 새 저장소입니다...',
			publish: '{{name}} 게시',
			private: '비공개로 유지',
			push: '변경사항 푸시',
			owner: '소유자',
			message: '이 저장소는 {{url}}에 게시됩니다.',
			auth: '저장소를 게시하려면 GitHub로 인증해야 합니다.',
			authHint: '아래 버튼을 클릭하여 OAuth 절차를 시작하세요.',
			authButton: '인증하기'
		},
		cherryPick: {
			title: '{{branch}}에서 {{current}}(으)로 체리픽',
			noCommits: '체리픽할 커밋 없음',
			noCommitsHint: '{{branch}}에는 {{current}}에 아직 없는 커밋이 없습니다.',
			action: '체리픽'
		},
		conflict: {
			title: '병합 충돌 발견',
			message: '브랜치를 전환하기 전에 해결해야 할 병합 충돌이 있습니다.',
			hint: '파일의 충돌을 해결하고 커밋하거나, 병합을 중단하여 모든 변경사항을 폐기하세요.',
			abort: '병합 중단',
			abortHint: '모든 병합 변경사항을 폐기하고 이전 상태로 되돌립니다.'
		},
		information: {
			metadata: '메타데이터',
			graph: '커밋 그래프',
			commitsMonth: '월별 커밋 수 ({{year}}년 {{month}}부터)',
			commitsInMonth: '{{month}}에 커밋 {{count}}개',
			gatheringInformation: '표시할 정보를 수집하는 중...',
			items: {
				unknown: '알 수 없음',
				diskPath: '디스크 경로',
				diskSize: '디스크 크기',
				updated: '마지막 업데이트',
				remote: '원격 URL'
			},
			month: {
				'0': '1월',
				'1': '2월',
				'2': '3월',
				'3': '4월',
				'4': '5월',
				'5': '6월',
				'6': '7월',
				'7': '8월',
				'8': '9월',
				'9': '10월',
				'10': '11월',
				'11': '12월'
			}
		},
		repository: {
			cancel: '취소',
			add: '추가',
			create: '생성',
			addRepo: '저장소 추가',
			createRepo: '저장소 생성',
			notGit: '디렉터리가 Git 저장소가 아닙니다. 생성하시겠습니까?',
			alreadyAdded: '{{name}}이(가) 이미 작업 공간에 있습니다.'
		},
		reload: {
			title: '클라이언트 새로고침',
			message: '새로고침이 필요한 설정이 변경되었습니다. 지금 새로고침하시겠습니까?'
		},
		error: {
			reload: '새로고침',
			reloadClient: '클라이언트 새로고침'
		},
		auth: {
			title: '인증 완료',
			expired: '인증 코드가 {{time}} 만료되었습니다. 다시 시도해 주세요.',
			willExpire: '인증 코드가 {{time}} 만료됩니다.',
			error: '인증 중 오류가 발생했습니다. 다시 시도해 주세요.',
			success: '성공! 이제 이 모달을 닫으셔도 됩니다.',
			copyCode: '코드 복사',
			openInBrowser: '브라우저에서 열기'
		},
		clone: {
			title: '저장소 클론',
			clone: '클론',
			search: '검색',
			searchLabel: '저장소 검색...',
			filter: '필터',
			loading: '불러오는 중...',
			loadingHint: '저장소를 가져오는 동안 기다려 주세요.',
			noRepos: '저장소를 찾을 수 없습니다.',
			noReposHint: '계정에 저장소를 추가해 보세요.',
			noReposButton: '브라우저에서 열기',
			error: '이런! 문제가 발생했습니다.',
			errorHint: '저장소를 수집하는 중 오류가 발생했습니다.',
			auth: '저장소를 보려면 제공자로 인증해야 합니다.',
			authHint: '아래 버튼을 클릭하여 OAuth 절차를 시작하세요.',
			authButton: '인증하기',
			authenticated: '인증됨',
			authenticate: 'OAuth로 인증',
			urlLabel: '저장소 URL',
			urlPlaceholder: 'https://{{lc:provider}}.com/relagit/relagit',
			localLabel: '로컬 경로',
			providers: {
				github: 'GitHub',
				gitlab: 'GitLab',
				codeberg: 'Codeberg',
				url: 'URL'
			}
		}
	}
} as const;
