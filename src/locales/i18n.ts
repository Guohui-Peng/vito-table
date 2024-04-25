import { ref } from "vue";
import { useI18n as useI18nOriginal } from "vue-i18n";

import type { Ref } from "vue";

// import type { DefineLocaleMessage } from "vue-i18n";
// import type { DefineLocaleMessage } from "@/types/vue-i18n";

import en from "./lang/en.json";
import zhCn from "./lang/zh-CN.json";

interface userI18nType {
	t: (key: string, values?: Record<string, unknown>) => string;
	locale: Ref<string>;
	setLocale: (newLocale: string) => void;
}

export function useI18n(): userI18nType {
	const locale = ref<string>("en-US"); // default locale is "en"
	// const supportedLocales = ["en", "zh-CN"]; // supported locales
	type MessageSchema = typeof en;
	const messages = {
		"en-US": en,
		"zh-CN": zhCn
	}; // messages for each locale
	const fallbackLocale = "en-US"; // fallback locale if locale is not supported
	const availableLocales = Object.keys(messages); // available locales

	const { t } = useI18nOriginal<{ messages: MessageSchema }, "en-US">({
		locale: locale.value,
		fallbackLocale: fallbackLocale,
		messages: messages
	});

	/**
	 * Sets the locale.
	 * @param newLocale - The new locale to set.
	 */
	function setLocale(newLocale: string) {
		if (availableLocales.includes(newLocale)) {
			locale.value = newLocale;
		} else {
			locale.value = fallbackLocale;
		}
	}

	return {
		t,
		locale,
		setLocale
	};
}
