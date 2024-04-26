import "virtual:uno.css";
import "element-plus/dist/index.css";

import { ref, provide, inject } from "vue";
import { useI18n, createI18n } from "vue-i18n";

import type { I18n } from "vue-i18n";
import type { App } from "vue";

import en from "@/locales/lang/en.json";
import zhCn from "@/locales/lang/zh-cn.json";

import VitoTable from "@/table";
import VitoTableV2 from "@/table-v2";

const messages = {
	"en-US": {
		...en
	},
	"zh-CN": {
		...zhCn
	}
};

const apiServerSymbol = Symbol();

const provideApiServer = (server: string) => {
	provide(apiServerSymbol, server);
};

export { VitoTableV2, VitoTable };

/**
 * Use remote API.
 * @returns { apiServer: string }
 */
export function useRemoteApi() {
	const apiServer = inject(apiServerSymbol);
	if (!apiServer) throw new Error("No API server provided!!!");

	return { apiServer };
}

export function createVitoTable(locale: string, api_server?: string) {
	if (api_server) {
		provideApiServer(api_server);
	}

	function install(app: App, options: any): void {
		const i18n = createI18n({
			legacy: false,
			locale: locale,
			fallbackLocale: ["en", "en-US", "zh-CN"],
			messages
		});

		app.use(i18n);
		app.use(VitoTable);
		app.use(VitoTableV2);
	}

	return {
		install
	};
}
