import { inject, provide, type Ref } from "vue";

const tokenSymbol = Symbol();

/**
 * Use token.
 * @returns { token: Ref<string> }
 */
export function useToken() {
	function provideToken(token: Ref<string> | string | null | undefined) {
		if (!token) {
			throw new Error("Token cannot be null or undefined");
		}
		provide(tokenSymbol, toRef(token));
	}

	const token = inject<Ref<string>>(tokenSymbol);

	return { token, provideToken };
}
