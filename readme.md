# Vito Table

一款基于 Element Plus 的 VUE Table 的增强表格控件。提供一些增强功能，如：筛选、导出、远程获取数据。

## 安装

```
npm install vito-table
```

## 使用示例

需配合 Element Plus 使用。项目中需要引入 Element Plus 、 Element Icons 及样式文件。多语言使用的 i18n 组件，需全局注册。

1. 全局注册并引入样式文件。在 main.ts 文件中注册 Element Plus 及 Vito Table 组件，并引入样式文件。示例如下：

    ```ts
    import "vito-table/dist/index.css"; // 引入样式文件
    import ElementPlus from "element-plus";
    import "element-plus/dist/index.css";
    import * as ElementPlusIconsVue from "@element-plus/icons-vue";
    import { createApp } from "vue";
    import { createI18n } from "vue-i18n";
    import { createVitoTable } from "vito-table";
    import App from "./App.vue";

    const i18n = createI18n({
      locale: "zh-CN",
      messages: ..., // 多语言配置
    });
    const app = createApp(App);
    app.use(i18n);
    app.use(ElementPlus);   // 全局注册 Element Plus
    // 全局注册图标
    for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
        app.component(key, component);
    }
    const vitoTable = createVitoTable({
        i18n: i18n,
        locale: "zh-CN"
    });
    app.use(vitoTable); // 全局注册 Vito Table
    app.mount("#app");
    ```

1. 组合方式使用组件

    ```html
    <script lang="ts" setup>
    	import { VitoTable } from "vito-table";

    	const data = [...]; // 数据源
    	const columns = [...]; // 列配置
    </script>
    <template>
    	<div>
    		<vito-table :data="data" :columns="columns" />
    	</div>
    </template>
    ```

## 表格配置

[表格配置说明](https://github.com/Guohui-Peng/vito-table/blob/main/VitoTable.md)

## License

Vito Table is open source software licensed under the [MIT license](https://opensource.org/licenses/MIT). 
