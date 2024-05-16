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
    	const columns = ref<[
    	       {
    	          key: "ID",
    	          dataKey: "ID",
    	          dataType: "text", // 列类型
    	          title: "ID",
    	          width: 80,    // 列宽度
    	          search: true,     // 显示搜索
    	          editable: false,  // 禁止编辑
    	          editoptions: {
    	              disabled: true
    	          }
    	          hidden: true  // 默认隐藏
    	      },
    	      {
    	          key: "Language",
    	          dataKey: "Language",
    	          dataType: "select",   // 下拉框
    	          title: "Language",
    	          width: 110,
    	          search: true,
    	          editable: true,
    	          editoptions: {
    	              disabled: true,   // 编辑时不允许修改，新增时可以
    	              options: [
    	                  { label: "English", value: "en" },
    	                  { label: "简体中文", value: "zh-CN" }
    	              ] // 下拉选项
    	          }
    	      },
    	      {
    	          key: "Value",
    	          dataKey: "Value",
    	          dataType: "text",
    	          title: "Value",   // 列名称
    	          minWidth: 150,    // 最小宽度，当未设置width时，将填充剩余空间
    	          editable: true,   // 允许编辑
    	          search: true,     // 允许搜索
    	          sortable: true    // 允许排序
    	      }
    	   ]; // 列配置
    </script>
    <template>
    	<div>
    		<vito-table :data="data" :columns="columns" />
    	</div>
    </template>
    ```

## 使用远程数据

Vito Table 提供了远程数据获取功能，通过设置 `remote-data` 属性为 `true` 开启远程数据获取功能。配置详见[表格配置](#表格配置)。在使用前需配置 API Server 地址以及 Access Token。示例如下：

```html
<script lang="ts" setup>
	import { useToken } from "...";
	const { token } = useToken(); // 获取 Access Token
</script>

<template>
	<vito-table :remote="true" :url="remoteApi" :edit-url="editUrl" :access-token="token" />
</template>
```

## 表格配置

[表格配置说明](https://github.com/Guohui-Peng/vito-table/blob/main/VitoTable.md)

## License

Vito Table is open source software licensed under the [MIT license](https://opensource.org/licenses/MIT).
