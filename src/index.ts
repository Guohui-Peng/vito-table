import "virtual:uno.css";

import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
// 导入图标，因为动态使用，需全局导入
import * as ElementPlusIconsVue from "@element-plus/icons-vue";

import type { App } from "vue";

import { createI18n } from "vue-i18n";
// 加载本程序中使用的语言包，语言包路径在vite.config.js中配置
import messages from "@intlify/unplugin-vue-i18n/messages";
import type { ComponentInternalInstance } from "vue";

import VitoTable from "@/table";
import VitoTableV2 from "@/table-v2";

export { VitoTableV2, VitoTable };

const i18n = createI18n({
	legacy: false, // you must set `false`, to use Composition API
	locale: "en",
	fallbackLocale: ["zh-Hans", "en"],
	missingWarn: false,
	fallbackWarn: false,
	// silentTranslationWarn: true,
	// formatFallbackMessages: true,
	messages,
	// saveMissing: true,
	// missingKeyNoValueFallbackToKey: true,
	missing: (
		locale: string,
		key: string,
		instance?: ComponentInternalInstance | undefined,
		type?: string | undefined
	) => {
		let result = key;
		if (key.includes(".")) {
			const newKey = key.split(".").slice(-1)[0];
			result = newKey;
		}
		result = result.replace(/([A-Z][^A-Z]+)/g, " $1").trim();

		return result;
	}
});

export default {
	install: (app: App, options?: any) => {
		// app.use(ElementPlus);
		// app.use(i18n);
		// 全局注册图标
		// for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
		// 	app.component(key, component);
		// }
		app.component("VitoTableV2", VitoTableV2);
		app.component("VitoTable", VitoTable);
	}
};
