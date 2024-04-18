import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
import path from "path";
import { fileURLToPath, URL } from "node:url";
import dts from "vite-plugin-dts";
import AutoImport from "unplugin-auto-import/vite";

export default defineConfig({
	resolve: {
		alias: {
			"@": fileURLToPath(new URL("./src", import.meta.url)),
			"~": fileURLToPath(new URL("./src", import.meta.url))
		}
	},
	plugins: [
		vue(),
		vueJsx(),
		AutoImport({
			imports: [
				"vue",
				"@vueuse/core",
				{
					"vue-i18n": ["useI18n"],
					pinia: ["createPinia", "storeToRefs"],
					"lodash-es": [["default", "_"]]
				}
			],
			dirs: ["./src/utils/functions"],
			dts: "./src/types/auto-imports.d.ts"
		}),
		// dts({ rollupTypes: true })
	],
	build: {
		lib: {
			entry: "./src/index.ts",
			name: "VtTable",
			fileName: "vt-table",
			formats: ["es"]
		},
		rollupOptions: {
			// 不想打包进库的依赖
			external: ["vue", "@vueuse/core", "element-plus"],
			output: {
				// 为外部的依赖提供一个全局变量
				globals: {
					vue: "Vue"
				}
			}
		}
	}
});
