import { inject, type App } from "vue";

const apiServerSymbol = Symbol();

export const provideApiServer = (app: App, server: string) => {
	app.provide(apiServerSymbol, server);
};

/**
 * Use remote API.
 * @returns { apiServer: string }
 */
export const useApiServer = () => {
	const apiServer = inject<string | undefined | null>(apiServerSymbol);
	// if (!apiServer) {
	// 	throw new Error("Api server not provided");
	// }
	return { apiServer };
};
