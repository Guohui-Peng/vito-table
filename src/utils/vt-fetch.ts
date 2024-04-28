import { createFetch, type MaybeRefOrGetter } from "@vueuse/core";
import { toValue } from "vue";
import type { Ref } from "vue";
import { useApiServer } from "./api-server";
import { useToken } from "./api-token";

/**
 * 用于请求后端API接口
 * @param apiServerUrl API server URL
 * @param token Access token
 * @returns { setApiServer, setToken, apiFetch }
 */
export function useApiFetch() {
	const { apiServer, provideApiServer } = useApiServer();
	const { token, provideToken } = useToken();

	const access_token = toValue(token);

	/**
	 * 设置 API server base URL
	 * @param serverUrl API server URL
	 */
	function setApiServer(serverUrl: string | Ref<string> | null) {
		provideApiServer(toValue(serverUrl) ?? "/api");
	}

	/**
	 * 设置 Access token
	 * @param token Access token
	 */
	function setToken(token: string | Ref<string> | null) {
		provideToken(token);
	}

	function apiFetch() {
		if (!apiServer) {
			throw new Error("API server URL is not set.");
		}

		return createFetch({
			baseUrl: apiServer,
			combination: "overwrite",
			options: {
				async beforeFetch({ options }) {
					const accessToken = access_token;
					if (accessToken) {
						const reqHeaders = new Headers(options.headers);
						reqHeaders.set("Authorization", `Bearer ${accessToken}`);
						options.headers = reqHeaders;
					}
					return { options };
				}
			},
			fetchOptions: {
				mode: "cors"
			}
		});
	}

	return { setApiServer, setToken, apiFetch };
}
