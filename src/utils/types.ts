import type { AppContext, Plugin } from "vue";

export type SFCInstall<T> = T & Plugin;

export type SFCInstallWithContext<T> = SFCInstall<T> & {
	_context: AppContext | null;
};
