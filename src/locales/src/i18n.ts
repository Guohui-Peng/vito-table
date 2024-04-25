import { ref } from "vue";
import { useI18n as useI18nOriginal } from "vue-i18n";

export function useI18n() {
	// const locale = ref<string>("en"); // default locale is "en"
	const { t, locale } = useI18nOriginal();

	/**
	 * Sets the locale.
	 * @param newLocale - The new locale to set.
	 */
	function setLocale(newLocale: string) {
		locale.value = newLocale;
	}

	return {
		locale,
		setLocale
	};
}
