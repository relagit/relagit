export * from './prompt';

const API_BASEURL = __AI_API_URL__;

export const sendAIRequest = async (
	prompt: string
): Promise<{
	body: string;
	message: string;
} | null> => {
	try {
		const res = await fetch(API_BASEURL, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				Authorization: `Bearer ${__AI_API_PASSWORD__}`
			},
			body: JSON.stringify({ prompt })
		});

		const json = (await res.json()) as {
			message: string;
			body: string;
			error?: string;
		};

		if (res.status !== 200 || json.error) {
			return null;
		}

		if (!json['message']) {
			return null;
		}

		return json;
	} catch (e) {
		return null;
	}
};
