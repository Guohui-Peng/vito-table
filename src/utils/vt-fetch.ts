import { toValue, type Ref } from "vue";

export function useApiFetch() {
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
			}
		});
	}

	return { apiFetch };
}
