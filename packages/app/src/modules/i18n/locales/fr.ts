export default {
	ai: {
		terms: {
			title: "Conditions d'utilisation de l'IA générative",
			message:
				"Avant de pouvoir utiliser les fonctionnalités génératives, vous devez accepter les conditions d'utilisation.",
			accept: 'Accepter',
			decline: 'Refuser'
		},
		error: {
			title: "Erreur lors de l'initialisation de l'IA",
			message:
				"Une erreur s'est produite lors de l'initialisation du service IA, veuillez vérifier vos paramètres."
		}
	},
	update: {
		download: 'Télécharger',
		ignore: 'Ignorer'
	},
	onboarding: {
		takeTour: 'Faire le tour',
		next: 'Suivant',
		dismiss: 'Ignorer',
		version: 'Version {{version}}',
		header: {
			tooltip: 'Ajoutez vos dépôts à partir du sélecteur de dépôts.'
		},
		add: {
			tooltip:
				'Utilisez ce sélecteur de fichiers pour ajouter un dépôt depuis votre appareil.',
			button: 'Maintenant, ajoutez-le à votre espace de travail.'
		},
		history: {
			tooltip: "À partir d'ici, vous pouvez consulter votre historique de commits."
		},
		modal: {
			title: 'Étapes suivantes',
			themes: 'Parcourir les thèmes clients',
			workflows: 'Parcourir les workflows',
			clone: 'Voir sur GitHub',
			somethingWrong: 'Vous avez trouvé quelque chose de faux ?',
			issue: 'Ouvrir un problème'
		}
	},
	settings: {
		title: 'Paramètres',
		close: 'Fermer les paramètres',
		restart: 'Redémarrage requis.',
		workflows: {
			title: 'Workflows',
			empty: {
				title: 'Aucun workflow',
				description: "Vous n'avez aucun workflow installé.",
				hint: 'Documentation'
			}
		},
		commits: {
			title: 'Git'
		},
		ai: {
			title: 'IA',
			model: {
				label: 'Modèle de langage',
				description: 'Sélectionnez le modèle de langage que vous souhaitez utiliser.',
				none: 'Aucun',
				noneHint: "Désactive toutes les fonctionnalités de l'IA",
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
				label: 'Clé API',
				description: 'Entrez votre clé API pour {{provider}}.',
				selected: 'votre fournisseur sélectionné',
				placeholder: '123456789012345678901234567-1234567890'
			}
		},
		accounts: {
			title: 'Comptes',
			signIn: 'Se connecter',
			signOut: 'Se déconnecter',
			github: 'GitHub',
			gitlab: 'GitLab',
			codeberg: 'Codeberg',
			url: '',
			keys: {
				access: 'Voir les dépôts',
				refresh: 'Régénérer les jetons',
				account: 'Accéder aux détails du compte',
				none: 'Aucune autorisation accordée'
			}
		},
		general: {
			title: 'Général',
			language: {
				label: 'Langue',
				description: 'Sélectionnez la langue que vous souhaitez utiliser.'
			},
			editor: {
				label: 'Éditeur externe',
				description:
					"Sélectionnez l'éditeur que vous souhaitez utiliser pour ouvrir les fichiers.",
				code: 'Visual Studio Code',
				codium: 'VSCodium',
				subl: 'Sublime Text',
				'code-insiders': 'Visual Studio Code Insiders',
				atom: 'Atom',
				zed: 'Zed',
				fleet: 'Fleet',
				custom: 'Éditeur personnalisé',
				customPlaceholder: 'mon-éditeur-personnalisé --args'
			},
			commitStyle: {
				label: 'Style de message de commit',
				description:
					"Sélectionnez le style de messages de commit que vous souhaitez utiliser. Cela n'affecte que le dépôt actuellement sélectionné",
				conventional: 'Commits conventionnels',
				relational: 'Commits relationnels',
				none: 'Aucun'
			},
			cloneMethod: {
				label: 'Méthode de clonage',
				description:
					'Sélectionnez la méthode que vous souhaitez utiliser pour cloner les dépôts.',
				http: 'HTTP',
				httpHint: 'Recommandé',
				ssh: 'SSH',
				sshHint: 'Nécessite que vous ayez une clé SSH configurée avec votre fournisseur.'
			},
			annotateCommit: {
				label: 'Annoter les commits',
				description:
					"Créditez @relagit-client en tant que committer (pas l'auteur) de vos commits. C'est un moyen gratuit de nous donner une certaine reconnaissance !"
			},
			enforceCommitStyle: {
				label: 'Appliquer le style de message de commit',
				description:
					'Cela vous empêchera de commettre si votre message de commit ne correspond pas au style sélectionné pour un dépôt.'
			},
			preferParens: {
				label: 'Préférer les parenthèses',
				description:
					'Préférer les parenthèses aux chevrons pour les styles de messages de commit.'
			},
			autoFetch: {
				label: 'Récupération automatique des dépôts',
				description:
					'Récupère automatiquement les dépôts au démarrage. A un impact important sur les performances de démarrage.'
			},
			debug: {
				copy: 'Copier les informations de débogage'
			}
		},
		appearance: {
			title: 'Apparence',
			vibrancy: {
				label: 'Vibrance sous la fenêtre',
				description:
					'Activer la vibrance sous la fenêtre. Cela peut avoir un impact sur les performances.'
			},
			theme: {
				label: 'Thème',
				description: 'Sélectionnez le thème que vous souhaitez utiliser.',
				light: 'Clair',
				dark: 'Sombre',
				system: 'Système',
				systemNote:
					"L'apparence de l'application changera en fonction des préférences du système d'exploitation.",
				choose: 'Sélectionnez le thème {{theme}}'
			},
			font: {
				label: 'Police personnalisée',
				description:
					"Cela remplacera la police de code par défaut. Vous pouvez utiliser n'importe quelle police installée sur votre système.",
				placeholder: 'SF Mono'
			},
			thinIcons: {
				label: 'Icônes fines',
				description: "Utiliser des variantes d'icônes plus fines dans l'en-tête."
			},
			clientThemes: {
				label: 'Thèmes clients',
				description:
					'Choisissez des thèmes créés par les utilisateurs à utiliser dans le client.'
			}
		}
	},
	error: {
		corruptSettings:
			'Un ou plusieurs de vos fichiers de configuration sont corrompus. Veuillez les réinitialiser.',
		fetching: "Erreur inattendue lors de la récupération de l'état du dépôt",
		remote: "Erreur inattendue lors de la récupération de l'état distant",
		git: "Impossible d'exécuter la commande Git",
		missingExternalEditor: "RelaGit n'a pas pu trouver votre éditeur externe dans votre PATH."
	},
	ui: {
		filepicker: {
			placeholder: 'Sélectionnez un fichier...',
			folderPlaceholder: 'Sélectionnez un dossier...',
			label: 'Ouvrir le sélecteur de fichiers',
			valid: 'Sélection valide',
			notEmpty: "{{type}} n'est pas vide",
			directory: ['Répertoire', 'Répertoires'],
			file: ['Fichier', 'Fichiers'],
			doesNotExist: "{{type}} n'existe pas",
			isNot: "{{type}} n'est pas un(e) {{expected}}"
		}
	},
	workspace: {
		commit: {
			open: 'Ouvrir {{hash}}'
		}
	},
	sidebar: {
		commit: {
			label: 'Ouvrir le commit {{hash}}'
		},
		drawer: {
			title: 'Dépôts',
			contextMenu: {
				addRepository: 'Ajouter un dépôt',
				createRepository: 'Créer un dépôt',
				cloneRepository: 'Cloner un dépôt',
				viewIn: 'Voir dans {{name}}',
				remove: 'Supprimer',
				useWorkflow: 'Utiliser comme workflow'
			},
			switchTo: 'Passer à {{name}}',
			openSettings: 'Ouvrir les paramètres',
			settings: 'Paramètres'
		},
		footer: {
			description: 'Description',
			summary: 'Résumé',
			commit: 'Commit sur {{branch}}',
			autogenerate: 'Générer les détails du commit',
			add: 'Ajouter',
			dangerous:
				'Vous avez des fichiers en attente qui peuvent contenir des informations sensibles. Veuillez vérifier vos modifications avant de commettre.',
			committedBy: 'Sera créé par {{user}}'
		},
		openDrawer: 'Ouvrir le tiroir du dépôt',
		upToDate: 'Vous êtes à jour.',
		noCommits: 'Aucun commit à afficher.',
		noRepo: 'Aucun dépôt sélectionné',
		noRepoHint: 'Sélectionnez-en un pour commencer.',
		noBranch: 'Aucune branche',
		open: 'Ouvrir {{name}}',
		contextMenu: {
			stage: 'Mettre les modifications en scène',
			unstage: 'Retirer les modifications de la scène',
			stash: 'Mettre les modifications en réserve',
			unstash: 'Retirer les modifications de la réserve',
			discard: 'Ignorer les modifications',
			ignore: 'Ajouter à .gitignore',
			ignoreAll: 'Ajouter tous les fichiers à .gitignore',
			ignoreExt: 'Ajouter tous les fichiers .{{ext}} à .gitignore',
			selected: ['{{count}} fichier sélectionné', '{{count}} fichiers sélectionnés'],
			viewIn: 'Voir dans {{name}}',
			openIn: 'Ouvrir dans {{name}}',
			openRemote: 'Ouvrir à distance',
			copySha: 'Copier le SHA',
			checkout: 'Passer au commit',
			revert: 'Annuler le commit',
			confirm: {
				discard: 'Ignorer en masse',
				discardMessage: 'Êtes-vous sûr de vouloir ignorer {{count}} modifications ?'
			}
		}
	},
	time: {
		second: ['{{count}} seconde', '{{count}} secondes'],
		minute: ['{{count}} minute', '{{count}} minutes'],
		hour: ['{{count}} heure', '{{count}} heures'],
		day: ['{{count}} jour', '{{count}} jours'],
		month: ['{{count}} mois', '{{count}} mois'],
		year: ['{{count}} an', '{{count}} ans'],
		ago: 'il y a',
		in: 'dans',
		now: "À l'instant"
	},
	codeview: {
		submodule: {
			title: 'Modifications du sous-module',
			cloned: 'Cloné dans',
			from: 'Récupération des modifications depuis',
			revision: 'Le sous-module est sur la révision',
			clone: 'Cloner le sous-module',
			cloneHint:
				'Clonez ce sous-module depuis le dépôt distant pour y apporter des modifications directement.',
			clonedHint: 'Ce sous-module est déjà cloné dans votre espace de travail.',
			open: 'Ouvrir {{name}}'
		},
		imageview: {
			error: 'Impossible de trouver une image à afficher',
			errorHint: "Cela est probablement dû à la taille trop importante de l'image.",
			sidebyside: 'Côte à côte',
			difference: 'Différence'
		},
		renamed: 'Fichier renommé sans modifications',
		renamedHint: 'Ce fichier a été renommé sans aucune modification de son contenu.',
		noCommit: 'Rien à voir ici',
		noCommitHint: 'Vous devez sélectionner un fichier pour voir ses modifications. (´・｀)',
		binary: 'Fichier binaire',
		binaryHint:
			"Désolé, nous ne pouvons pas vous montrer la différence pour ce fichier car il s'agit d'un fichier binaire.",
		loading: 'Chargement...',
		loadingHint: 'Cela ne devrait pas prendre trop de temps.',
		errorHint: "Une erreur s'est produite lors du chargement du fichier.",
		noChanges: 'Aucune modification en attente',
		noChangesHint: "Prenez une pause ! Vous l'avez bien mérité.",
		noFile: 'Aucun fichier sélectionné.',
		noFileHint: "Cliquez sur l'un dans la barre latérale là-bas （´・｀） pour commencer.",
		tooBig: 'Fichiers trop puissants !',
		tooBigHint:
			'Ce fichier est tellement énorme que nous ne le rendons pas pour des raisons de performances.'
	},
	git: {
		sync: 'Synchroniser',
		hide: 'Masquer',
		publish: 'Publier la branche',
		publishHint: 'Publier cette branche sur le dépôt distant.',
		branches: ['Branche', 'Branches'],
		deleteBranch: 'Supprimer la branche',
		mergeBranch: 'Fusionner {{branch}} dans {{current}}',
		cherryPick: 'Cherry Pick depuis {{branch}} dans {{current}}',
		newBranch: 'Nouvelle branche',
		createBranch: 'Créer une branche',
		pushChanges: 'Pousser les modifications',
		push: ['Pousser {{count}} modification', 'Pousser {{count}} modifications'],
		pullChanges: 'Tirer les modifications',
		pull: ['Tirer {{count}} modification', 'Tirer {{count}} modifications'],
		noChanges: 'Aucune modification',
		diverged: 'Les arbres ont divergé',
		divergedHint: 'Mettez les modifications en réserve et tirez',
		nothingToSee: 'Rien à voir ici',
		popStash: 'Récupérer la réserve',
		commits: ['{{count}} commit', '{{count}} commits'],
		stashedChanges: [
			'{{stashCount}} réserve ({{count}})',
			'{{stashCount}} réserves ({{count}})'
		],
		removeStash: 'Supprimer la réserve',
		files: ['{{count}} fichier', '{{count}} fichiers'],
		undo: 'Annuler {{sha}}',
		remote: {
			view: 'Voir {{name}}',
			issue: ['Problème', 'Problèmes'],
			pull: ['Demande de tirage', 'Demandes de tirage']
		}
	},
	palette: {
		hint: [
			'Affichage de {{count}} sur {{total}} dépôt',
			'Affichage de {{count}} sur {{total}} dépôts'
		],
		empty: 'Aucun dépôt trouvé.'
	},
	modal: {
		closeModal: 'Fermer la fenêtre modale',
		confirm: 'Confirmer',
		cancel: 'Annuler',
		close: 'Fermer',
		log: {
			title: 'Journal des commandes'
		},
		providers: {
			title: "Fournisseurs d'authentification",
			hint: 'Veuillez sélectionner le fournisseur avec lequel vous souhaitez vous authentifier.'
		},
		publish: {
			title: 'Publier le dépôt',
			name: 'Nom',
			description: 'Description',
			descriptionPlaceholder: 'Ceci est mon nouveau dépôt cool, il...',
			publish: 'Publier {{name}}',
			private: 'Rester privé',
			push: 'Pousser les modifications',
			owner: 'Propriétaire',
			message: "Ce dépôt sera publié à l'adresse {{url}}.",
			auth: 'Vous devez vous authentifier avec GitHub pour publier votre dépôt.',
			authHint: 'Cliquez sur le bouton ci-dessous pour commencer le processus OAuth.',
			authButton: "S'authentifier"
		}
	}
} as const;
