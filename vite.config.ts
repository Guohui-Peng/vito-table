import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import vueJsx from "@vitejs/plugin-vue-jsx";
// import path from "path";
import { fileURLToPath, URL } from "node:url";
import dts from "vite-plugin-dts";
import AutoImport from "unplugin-auto-import/vite";
import UnoCSS from "unocss/vite";
import VueI18nPlugin from "@intlify/unplugin-vue-i18n/vite";

import { resolve, dirname } from "node:path";

// import Components from "unplugin-vue-components/vite";
// import { ElementPlusResolver } from "unplugin-vue-components/resolvers";

function pathResolve(dir) {
	return resolve(__dirname, ".", dir);
}

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
		UnoCSS(),
		VueI18nPlugin({
			// locale messages resource pre-compile option
			include: pathResolve("./src/locales/lang/**")
		}),
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
		})
		// dts({
		// 	beforeWriteFile: (filePath, content) => ({
		// 		filePath: filePath.replace("path/to/file.d.ts", "index.d.ts"),
		// 		content
		// 	}),
		// 	pathsToAliases: true,
		// 	outputDir: pathResolve("./dist/types"),
		// 	include: ["./src/types/**/*.d.ts"]
		// })
	],
	build: {
		lib: {
			entry: "./src/index.ts",
			name: "VitoTable",
			fileName: "index"
			// formats: ["es"],
		},
		minify: "esbuild",
		sourcemap: false,
		cssCodeSplit: true,
		rollupOptions: {
			// 不想打包进库的依赖
			external: [
				"vue",
				"element-plus",
				"@element-plus/icons-vue",
				"vue-i18n",
				"xlsx",
				"dayjs"
			],
			output: {
				// 为外部的依赖提供一个全局变量
				globals: {
					vue: "Vue",
					xlsx: "XLSX",
					"element-plus": "ElementPlus",
					"vue-i18n": "VueI18n",
					"@element-plus/icons-vue": "ElementPlusIconsVue",
					dayjs: "dayjs"
				}
			}
		}
	}
});
