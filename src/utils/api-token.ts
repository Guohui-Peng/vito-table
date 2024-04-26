import { provide, inject } from "vue";
import type { Ref } from "vue";

const tokenSymbol = Symbol();

export const provideToken = (token: Ref<string | undefined | null>) => {
	provide(tokenSymbol, token);
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
