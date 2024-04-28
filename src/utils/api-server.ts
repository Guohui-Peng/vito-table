import { inject, provide } from "vue";

/**
 * Use remote API.
 * @returns { apiServer: string }
 */
export const useApiServer = () => {
	const API_SERVER_KEY: string = "VITO-TABLE-API-SERVER";

	function provideApiServer(server: string) {
		provide(API_SERVER_KEY, server);
	}

	const apiServer = inject<string | undefined | null>(API_SERVER_KEY);

	return { apiServer, provideApiServer };
};
