import { toValue, type Ref } from "vue";
import { createFetch, type useFetch } from "@vueuse/core";
import { useApiServer } from "./api-server";
import { useToken } from "./api-token";

/**
 * 用于请求后端API接口
 * @param apiServerUrl API server URL
 * @param token Access token
 * @returns useFetch
 */
export function useApiFetch(): typeof useFetch {
	const { apiServer } = useApiServer();
	const { token } = useToken();
	if (!apiServer) {
		throw new Error("API server URL is not set.");
	}

	if (!token) {
		throw new Error("Access token is not set.");
	}
	return createFetch({
		baseUrl: apiServer,
		combination: "overwrite",
		options: {
			async beforeFetch({ options }) {
				// const { token } = token;
				const accessToken = token.value;
				const reqHeaders = new Headers(options.headers);
				reqHeaders.set("Authorization", `Bearer ${accessToken}`);
				options.headers = reqHeaders;
				// options.headers["Authorization"] = `Bearer ${accessToken}`;
				return { options };
			}
		},
		fetchOptions: {
			mode: "cors"
		}
	});
}
