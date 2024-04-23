import { NOOP } from "@vue/shared";
import type { App, Directive } from "vue";
import type { SFCInstallWithContext, SFCInstall } from "./types";

export const easyInstall = <T, E extends Record<string, any>>(main: T, extra?: E) => {
	(main as SFCInstall<T>).install = (app: App): void => {
		for (const comp of [main, ...Object.values(extra ?? {})]) {
			app.component(comp.name, comp);
		}
	};

	if (extra) {
		for (const [key, comp] of Object.entries(extra)) {
			(main as any)[key] = comp;
		}
	}
	return main as SFCInstall<T> & E;
};

export const easyInstallFunction = <T>(fn: T, name: string) => {
	(fn as SFCInstall<T>).install = (app: App) => {
		(fn as SFCInstallWithContext<T>)._context = app._context;
		app.config.globalProperties[name] = fn;
	};

	return fn as SFCInstallWithContext<T>;
};

export const easyInstallDirective = <T extends Directive>(directive: T, name: string) => {
	(directive as SFCInstall<T>).install = (app: App): void => {
		app.directive(name, directive);
	};

	return directive as SFCInstall<T>;
};

export const easyNoopInstall = <T>(component: T) => {
	(component as SFCInstall<T>).install = NOOP;

	return component as SFCInstall<T>;
};
