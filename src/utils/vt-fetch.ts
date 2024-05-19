import { toValue, type Ref } from "vue";

export function useApiFetch(
	fetchError: ((ctx: { data: any; response: Response | null; error: any }) => void) | null = null
) {
	function apiFetch<T>(url: string | Ref<string>, token?: string | Ref<string> | null) {
		return useFetch<T>(url, {
			async beforeFetch({ url, options, cancel }) {
				const myToken = toValue(token);

				if (!myToken) cancel();

				options.headers = {
					...options.headers,
					Authorization: `Bearer ${myToken}`
				};

				return {
					options
				};
			},
			// updateDataOnError: true,
			onFetchError(ctx) {
				if (fetchError && typeof fetchError === "function") {
					fetchError(ctx);
				}
				return ctx;
			}
		});
	}

	return { apiFetch };
}
