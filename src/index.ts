import "virtual:uno.css";
import "element-plus/dist/index.css";

import { ref, toValue } from "vue";
import { useI18n, createI18n } from "vue-i18n";

import { provideApiServer, provideToken } from "./utils";

import type { I18n } from "vue-i18n";
import type { App } from "vue";

import en from "@/locales/lang/en.json";
import zhCn from "@/locales/lang/zh-cn.json";

import VitoTable from "@/table";
import VitoTableV2 from "@/table-v2";

const messages: Record<string, any> = {
	en: en,
	"en-US": en,
	"zh-CN": zhCn
};

export { VitoTableV2, VitoTable };

/**
 * Options for creating VitoTable.
 */
export interface VitoTableOptions {
	/**
	 * 当前语言
	 */
	locale?: string;
	/**
	 * API 服务器地址
	 */
	api_server?: string;
	/**
	 * i18n 实例
	 */
	i18n?: I18n;
	/**
	 * Access token，用于访问 API 资源
	 */
	token?: Ref<string | undefined | null>;
}

export function createVitoTable(options: VitoTableOptions) {
	if (options.api_server) {
		provideApiServer(options.api_server);
	}

	if (options.token) {
		provideToken(options.token);
	}

	function install(app: App): void {
		if (options?.i18n) {
			const i18n = options.i18n;
			const locale = toValue(i18n.global.locale) || "en-US";
			const localMessages: Record<string, any> = i18n.global.getLocaleMessage(locale);
			const message: Record<string, any> = messages[locale] as Record<string, any>;
			const mergedMessages = { ...message, ...localMessages };
			i18n.global.setLocaleMessage(locale, mergedMessages);
		} else {
			const locale = options.locale || "en-US";
			const i18n = createI18n({
				legacy: false,
				locale: locale,
				fallbackLocale: ["en", "en-US", "zh-CN"],
				messages: messages
			});
			app.use(i18n);
		}
		// 组合模式使用，不用全局注册
		// app.use(VitoTable);
		// app.use(VitoTableV2);
	}

	return {
		install
	};
}
