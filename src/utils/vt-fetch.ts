import { toValue } from "vue";
import type { Ref } from "vue";
import { createFetch, type useFetch } from "@vueuse/core";

/**
 * 用于请求后端API接口
 * @param apiServerUrl API server URL
 * @param token Access token
 * @returns useFetch
 */
export function useApiFetch(
	apiServerUrl: string | Ref<string> | null | undefined,
	token: string | Ref<string> | null | undefined
): typeof useFetch {
	const server_url = toValue(apiServerUrl);
	const token_value: string | null | undefined = toValue(token);
	if (token_value === null || token_value === undefined || server_url === null || server_url === undefined) {
		return createFetch({
			baseUrl: "/api",
			combination: "overwrite",
			fetchOptions: {
				mode: "cors"
			}
		});
	} else {
		return createFetch({
			baseUrl: server_url,
			combination: "overwrite",
			options: {
				async beforeFetch({ options }) {
					const accessToken = token_value;
					const reqHeaders = new Headers(options.headers);
					reqHeaders.set("Authorization", `Bearer ${accessToken}`);
					options.headers = reqHeaders;
					return { options };
				}
			},
			fetchOptions: {
				mode: "cors"
			}
		});
	}
}
