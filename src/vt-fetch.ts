import { createFetch } from "@vueuse/core";
// import { storeToRefs } from "pinia";
// import settings from "@/settings";
// import { useUserStore } from "@/stores";

/**
 * @description: 用于请求后端API接口
 */
export const useApiFetch = createFetch({
	baseUrl: settings.server.apiServer,
	combination: "overwrite",
	options: {
		// async beforeFetch({ options }) {
		// 	const { token } = storeToRefs(useUserStore());
		// 	const accessToken = token.value.accessToken;
		// 	const reqHeaders = new Headers(options.headers);
		// 	reqHeaders.set("Authorization", `Bearer ${accessToken}`);
		// 	options.headers = reqHeaders;
		// 	// options.headers["Authorization"] = `Bearer ${accessToken}`;
		// 	return { options };
		}
	},
	fetchOptions: {
		mode: "cors"
	}
});

/**
 * @description: 用于请求后端用户接口
 */
export const useUserFetch = createFetch({
	baseUrl: settings.authentication.authority,
	options: {
		// async beforeFetch({ options }) {
		// 	const { token } = storeToRefs(useUserStore());
		// 	const accessToken = token.value.accessToken;
		// 	const reqHeaders = new Headers(options.headers);
		// 	reqHeaders.set("Authorization", `Bearer ${accessToken}`);
		// 	options.headers = reqHeaders;
		// 	return { options };
		// }
	},
	fetchOptions: {
		mode: "cors"
	}
});
