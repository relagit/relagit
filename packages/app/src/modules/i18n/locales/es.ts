export default {
	ai: {
		terms: {
			title: 'Términos del servicio de IA generativa',
			message:
				'Antes de poder utilizar las funciones generativas, debes aceptar los términos del servicio.',
			accept: 'Aceptar',
			decline: 'Rechazar'
		}
	},
	update: {
		download: 'Descargar',
		ignore: 'Ignorar'
	},
	onboarding: {
		takeTour: 'Realizar el recorrido',
		next: 'Siguiente',
		dismiss: 'Descartar',
		version: 'Versión {{version}}',
		header: {
			tooltip: 'Agrega tus repositorios desde el selector de repositorios.'
		},
		add: {
			tooltip:
				'Utiliza este selector de archivos para agregar un repositorio desde tu dispositivo.',
			button: 'Ahora agrégalo a tu espacio de trabajo.'
		},
		history: {
			tooltip: 'Desde aquí, puedes ver tu historial de confirmaciones.'
		},
		modal: {
			title: 'Siguientes pasos',
			themes: 'Explorar temas del cliente',
			workflows: 'Explorar flujos de trabajo',
			clone: 'Ver en GitHub',
			somethingWrong: '¿Encuentras algo incorrecto?',
			issue: 'Abrir un problema'
		}
	},
	settings: {
		title: 'Configuración',
		close: 'Cerrar configuración',
		restart: 'Requiere reinicio.',
		workflows: {
			title: 'Flujos de trabajo',
			empty: {
				title: 'Sin flujos de trabajo',
				description: 'No tienes ningún flujo de trabajo instalado.',
				hint: 'Documentación'
			}
		},
		commits: {
			title: 'Git'
		},
		accounts: {
			title: 'Cuentas',
			signIn: 'Iniciar sesión',
			signOut: 'Cerrar sesión',
			github: 'GitHub',
			gitlab: 'GitLab',
			codeberg: 'Codeberg',
			url: '',
			keys: {
				access: 'Ver repositorios',
				refresh: 'Regenerar tokens',
				account: 'Acceder a los detalles de la cuenta',
				none: 'No se han otorgado permisos'
			}
		},
		general: {
			title: 'General',
			language: {
				label: 'Idioma',
				description: 'Selecciona el idioma que deseas utilizar.'
			},
			editor: {
				label: 'Editor externo',
				description: 'Selecciona el editor que deseas utilizar para abrir archivos.',
				code: 'Visual Studio Code',
				codium: 'VSCodium',
				subl: 'Sublime Text',
				'code-insiders': 'Visual Studio Code Insiders',
				atom: 'Atom',
				zed: 'Zed',
				fleet: 'Fleet'
			},
			commitStyle: {
				label: 'Estilo de mensaje de confirmación',
				description:
					'Selecciona el estilo de los mensajes de confirmación que deseas utilizar. Esto solo afecta al repositorio seleccionado actualmente',
				conventional: 'Confirmaciones convencionales',
				relational: 'Confirmaciones relacionales',
				none: 'Ninguno'
			},
			cloneMethod: {
				label: 'Método de clonación',
				description: 'Selecciona el método que deseas utilizar para clonar repositorios.',
				http: 'HTTP',
				httpHint: 'Recomendado',
				ssh: 'SSH',
				sshHint: 'Requiere que tengas una clave SSH configurada con tu proveedor.'
			},
			annotateCommit: {
				label: 'Anotar confirmaciones',
				description:
					'Acredita a @relagit-client como el confirmante (no autor) de tus confirmaciones. ¡Esta es una forma gratuita de reconocernos!'
			},
			enforceCommitStyle: {
				label: 'Aplicar estilo de mensaje de confirmación',
				description:
					'Esto evitará que confirmes si tu mensaje de confirmación no coincide con el estilo seleccionado para un repositorio.'
			},
			preferParens: {
				label: 'Preferir paréntesis',
				description:
					'Prefiere paréntesis en lugar de corchetes angulares para los estilos de mensajes de confirmación.'
			},
			autoFetch: {
				label: 'Buscar automáticamente repositorios',
				description:
					'Buscar automáticamente repositorios al iniciar. Tiene un gran impacto en el rendimiento al iniciar.'
			},
			debug: {
				copy: 'Copiar información de depuración'
			}
		},
		appearance: {
			title: 'Apariencia',
			vibrancy: {
				label: 'Vibración debajo de la ventana',
				description:
					'Habilita la vibración debajo de la ventana. Esto puede afectar el rendimiento.'
			},
			theme: {
				label: 'Tema',
				description: 'Selecciona el tema que deseas utilizar.',
				light: 'Claro',
				dark: 'Oscuro',
				system: 'Sistema',
				systemNote:
					'La apariencia de la aplicación cambiará según las preferencias del sistema operativo.',
				choose: 'Seleccionar tema {{theme}}'
			},
			font: {
				label: 'Fuente personalizada',
				description:
					'Esto anulará la fuente de código predeterminada. Puedes utilizar cualquier fuente instalada en tu sistema.',
				placeholder: 'SF Mono'
			},
			thinIcons: {
				label: 'Iconos delgados',
				description: 'Utiliza variantes de iconos más delgadas en el encabezado.'
			},
			clientThemes: {
				label: 'Temas del cliente',
				description: 'Selecciona temas creados por usuarios para utilizar en el cliente.'
			}
		}
	},
	error: {
		corruptSettings:
			'Uno o más de tus archivos de configuración están corruptos. Restablécelos, por favor.',
		fetching: 'Error inesperado al obtener el estado del repositorio',
		remote: 'Error inesperado al obtener el estado remoto',
		git: 'Error inesperado al ejecutar el comando git',
		missingExternalEditor: 'RelaGit no pudo encontrar tu editor externo en tu PATH.'
	},
	ui: {
		filepicker: {
			placeholder: 'Selecciona un archivo...',
			folderPlaceholder: 'Selecciona una carpeta...',
			label: 'Abrir selector de archivos',
			valid: 'Selección válida',
			notEmpty: '{{type}} no está vacío',
			directory: ['Directorio', 'Directorios'],
			file: ['Archivo', 'Archivos'],
			doesNotExist: '{{type}} no existe',
			isNot: '{{type}} no es un(a) {{expected}}'
		}
	},
	workspace: {
		commit: {
			open: 'Abrir {{hash}}'
		}
	},
	sidebar: {
		commit: {
			label: 'Abrir confirmación {{hash}}'
		},
		drawer: {
			title: 'Buscar Repositorios...',
			contextMenu: {
				addRepository: 'Agregar repositorio',
				createRepository: 'Crear repositorio',
				cloneRepository: 'Clonar repositorio',
				viewIn: 'Ver en {{name}}',
				remove: 'Eliminar',
				useWorkflow: 'Usar como flujo de trabajo'
			},
			switchTo: 'Cambiar a {{name}}',
			openSettings: 'Abrir configuración',
			settings: 'Configuración'
		},
		footer: {
			description: 'Descripción',
			summary: 'Resumen',
			commit: 'Confirmar en {{branch}}',
			autogenerate: 'Generar detalles de confirmación',
			add: 'Agregar',
			dangerous:
				'Tienes archivos en preparación que pueden contener información confidencial. Por favor, revisa tus cambios antes de confirmar.',
			committedBy: 'Será confirmado por {{user}}'
		},
		openDrawer: 'Abrir el cajón del repositorio',
		upToDate: 'Todo está actualizado.',
		noCommits: 'No hay confirmaciones para mostrar.',
		noRepo: 'Ningún repositorio seleccionado',
		noRepoHint: 'Selecciona uno para comenzar.',
		noBranch: 'Sin rama',
		open: 'Abrir {{name}}',
		contextMenu: {
			stage: 'Preparar cambios',
			unstage: 'Despreparar cambios',
			stash: 'Guardar cambios',
			unstash: 'Recuperar cambios guardados',
			discard: 'Descartar cambios',
			ignore: 'Agregar a .gitignore',
			ignoreAll: 'Agregar todos los archivos a .gitignore',
			ignoreExt: 'Agregar todos los archivos .{{ext}} a .gitignore',
			selected: ['{{count}} archivo seleccionado', '{{count}} archivos seleccionados'],
			viewIn: 'Ver en {{name}}',
			openIn: 'Abrir en {{name}}',
			openRemote: 'Abrir remoto',
			copySha: 'Copiar SHA',
			checkout: 'Cambiar a esta confirmación',
			revert: 'Revertir confirmación',
			confirm: {
				discard: 'Descartar en bloque',
				discardMessage: '¿Estás seguro de que deseas descartar {{count}} cambios?'
			}
		}
	},
	time: {
		second: ['{{count}} segundo', '{{count}} segundos'],
		minute: ['{{count}} minuto', '{{count}} minutos'],
		hour: ['{{count}} hora', '{{count}} horas'],
		day: ['{{count}} día', '{{count}} días'],
		month: ['{{count}} mes', '{{count}} meses'],
		year: ['{{count}} año', '{{count}} años'],
		ago: 'hace',
		in: 'en',
		now: 'Justo ahora'
	},
	codeview: {
		submodule: {
			title: 'Cambios en el submódulo',
			cloned: 'Clonado en',
			from: 'Obteniendo cambios de',
			revision: 'El submódulo está en la revisión',
			clone: 'Clonar submódulo',
			cloneHint:
				'Clona este submódulo desde el remoto para confirmar cambios directamente en él.',
			clonedHint: 'Este submódulo ya está clonado en tu espacio de trabajo.',
			open: 'Abrir {{name}}'
		},
		imageview: {
			error: 'No se pudo encontrar una imagen para mostrar',
			errorHint:
				'Esto probablemente se debe a que la imagen es demasiado grande para mostrarla.',
			sidebyside: 'Lado a lado',
			difference: 'Diferencia'
		},
		renamed: 'Archivo renombrado sin cambios',
		renamedHint: 'Este archivo cambió de nombre sin cambios en su contenido.',
		noCommit: 'No hay nada que ver aquí',
		noCommitHint: 'Debes seleccionar un archivo para ver sus cambios. (´・｀)',
		binary: 'Archivo binario',
		binaryHint:
			'Lo siento, no podemos mostrarte la diferencia de este archivo ya que es un archivo binario.',
		loading: 'Cargando...',
		loadingHint: 'Esto no debería tardar mucho.',
		errorHint: 'Algo salió mal al cargar el archivo.',
		noChanges: '¡No hay cambios pendientes!',
		noChangesHint: '¡Tómate un descanso! Te lo has ganado.',
		noFile: 'Ningún archivo seleccionado.',
		noFileHint: 'Haz clic en uno en la barra lateral allí （´・｀） para comenzar.',
		tooBig: '¡Archivos demasiado poderosos!',
		tooBigHint:
			'Este archivo es tan grande que no lo estamos mostrando por razones de rendimiento.'
	},
	git: {
		sync: 'Sincronizar',
		hide: 'Ocultar',
		publish: 'Publicar rama',
		publishHint: 'Publica esta rama en el remoto.',
		branches: ['Rama', 'Ramas'],
		deleteBranch: 'Eliminar rama',
		newBranch: 'Nueva rama',
		createBranch: 'Crear rama',
		pushChanges: 'Enviar cambios',
		push: ['Enviar {{count}} cambio', 'Enviar {{count}} cambios'],
		pullChanges: 'Obtener cambios',
		pull: ['Obtener {{count}} cambio', 'Obtener {{count}} cambios'],
		noChanges: 'Sin cambios',
		diverged: 'Los árboles han divergido',
		divergedHint: 'Guarda los cambios y obtén',
		nothingToSee: 'Nada que ver aquí',
		popStash: 'Recuperar cambios guardados',
		commits: ['{{count}} confirmación', '{{count}} confirmaciones'],
		stashedChanges: [
			'{{stashCount}} cambio guardado ({{count}})',
			'{{stashCount}} cambios guardados ({{count}})'
		],
		removeStash: 'Eliminar cambio guardado',
		files: ['{{count}} archivo', '{{count}} archivos'],
		undo: 'Deshacer {{sha}}'
	},
	palette: {
		hint: [
			'Mostrando {{count}} de {{total}} repositorio',
			'Mostrando {{count}} de {{total}} repositorios'
		],
		empty: 'No se encontraron repositorios.'
	},
	modal: {
		closeModal: 'Cerrar modal',
		confirm: 'Confirmar',
		cancel: 'Cancelar',
		close: 'Cerrar',
		log: {
			title: 'Registro de comandos'
		},
		providers: {
			title: 'Proveedores de autenticación',
			hint: 'Selecciona el proveedor con el que deseas autenticarte.'
		},
		publish: {
			title: 'Publicar repositorio',
			name: 'Nombre',
			description: 'Descripción',
			descriptionPlaceholder: 'Este es mi nuevo repositorio genial, es...',
			publish: 'Publicar {{name}}',
			private: 'Mantener esto privado',
			push: 'Enviar cambios',
			owner: 'Propietario',
			message: 'Este repositorio se publicará en {{url}}.',
			auth: 'Debes autenticarte con GitHub para publicar tu repositorio.',
			authHint: 'Haz clic en el botón de abajo para iniciar el proceso de OAuth.',
			authButton: 'Autenticar'
		},
		information: {
			metadata: 'Metadatos',
			graph: 'Gráfico de confirmaciones',
			commitsMonth: 'Confirmaciones por mes (Desde {{month}}, {{year}})',
			commitsInMonth: '{{count}} confirmaciones en {{month}}',
			gatheringInformation: 'Recopilando información para mostrar...',
			items: {
				unknown: 'Desconocido',
				diskPath: 'Ruta en disco',
				diskSize: 'Tamaño en disco',
				updated: 'Última actualización',
				remote: 'URL remoto'
			},
			month: {
				'0': 'Enero',
				'1': 'Febrero',
				'2': 'Marzo',
				'3': 'Abril',
				'4': 'Mayo',
				'5': 'Junio',
				'6': 'Julio',
				'7': 'Agosto',
				'8': 'Septiembre',
				'9': 'Octubre',
				'10': 'Noviembre',
				'11': 'Diciembre'
			}
		},
		repository: {
			cancel: 'Cancelar',
			add: 'Agregar',
			create: 'Crear',
			addRepo: 'Agregar repositorio',
			createRepo: 'Crear repositorio',
			notGit: 'El directorio no es un repositorio Git. ¿Deseas crear uno?',
			alreadyAdded: 'Ya tienes {{name}} en tu espacio de trabajo.'
		},
		reload: {
			title: 'Recargar cliente',
			message:
				'Se ha cambiado una configuración que requiere una recarga. ¿Deseas recargar ahora?'
		},
		error: {
			reload: 'Recargar',
			reloadClient: 'Recargar cliente'
		},
		auth: {
			title: 'Completar autenticación',
			expired: 'Tu código de verificación expira en {{time}}. Por favor, inténtalo de nuevo.',
			willExpire: 'Tu código de verificación expirará en {{time}}.',
			error: 'Ocurrió un error al autenticar. Por favor, inténtalo de nuevo.',
			success: '¡Éxito! Ahora puedes cerrar este modal.',
			copyCode: 'Copiar código',
			openInBrowser: 'Abrir en el navegador'
		},
		clone: {
			title: 'Clonar repositorio',
			clone: 'Clonar',
			search: 'Buscar',
			searchLabel: 'Buscar un repositorio...',
			filter: 'Filtrar',
			loading: 'Cargando...',
			loadingHint: 'Por favor, espera mientras obtenemos tus repositorios.',
			noRepos: 'No se encontraron repositorios.',
			noReposHint: 'Intenta agregar algunos repositorios a tu cuenta.',
			noReposButton: 'Abrir en el navegador',
			error: '¡Ups! Algo salió mal.',
			errorHint: 'Hemos fallado al intentar obtener tus repositorios.',
			auth: 'Debes autenticarte con un proveedor para ver tus repositorios.',
			authHint: 'Haz clic en el botón de abajo para iniciar el proceso de OAuth.',
			authButton: 'Autenticar',
			authenticated: 'Autenticado',
			authenticate: 'Autenticar mediante OAuth',
			urlLabel: 'URL del repositorio',
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
