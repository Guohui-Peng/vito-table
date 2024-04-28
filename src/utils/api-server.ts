import { inject, provide } from "vue";

const apiServerSymbol = Symbol();

/**
 * Use remote API.
 * @returns { apiServer: string }
 */
export const useApiServer = () => {
	const apiServer = inject<string | undefined | null>(apiServerSymbol);

	function provideApiServer(server: string) {
		provide(apiServerSymbol, server);
	}
	return { apiServer, provideApiServer };
};
