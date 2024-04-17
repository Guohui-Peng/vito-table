import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import path from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
	resolve: {
		alias: {
			"@": path.resolve(__dirname, "src")
		}
	},
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
	},
	plugins: [vue(), dts({rollupTypes:true})]
});
