import { inject } from "vue";
import type { Ref, App } from "vue";

const tokenSymbol = Symbol();

export const provideToken = (app: App, token: Ref<string | undefined | null>) => {
	app.provide(tokenSymbol, token);
};

/**
 * Use token.
 * @returns { token: Ref<string | undefined | null> }
 */
export const useToken = () => {
	const token = inject<Ref<string | undefined | null>>(tokenSymbol);
	if (!token) {
		throw new Error("Token not provided");
	}
	return { token };
};
