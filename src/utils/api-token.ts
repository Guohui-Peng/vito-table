import { inject, provide, type Ref } from "vue";

/**
 * Use token.
 * @returns { token: Ref<string> }
 */
export function useToken() {
	const TOKEN_KEY:string = "VITO-TABLE-TOKEN";

	function provideToken(token: Ref<string> | string | null | undefined) {
		if (!token) {
			throw new Error("Token cannot be null or undefined");
		}
		provide(TOKEN_KEY, toRef(token));
	}

	const token = inject<Ref<string>>(TOKEN_KEY);

	return { token, provideToken };
}
