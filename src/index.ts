import "virtual:uno.css";
import "element-plus/dist/index.css";

import { toValue } from "vue";
import { createI18n } from "vue-i18n";

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

export * from "@/utils/vt-fetch";

/**
 * Options for creating VitoTable.
 */
export interface VitoTableOptions {
	/**
	 * 当前语言
	 */
	locale?: string;
	/**
	 * i18n 实例
	 */
	i18n?: I18n;
}

/**
 * 初始化 VitoTable 插件
 * @param options 选项
 * @returns install 函数
 */
export function createVitoTable(options: VitoTableOptions) {
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
	}

	return {
		install
	};
}
