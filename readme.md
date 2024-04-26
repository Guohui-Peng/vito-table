# Vito Table

一款基于 Element Plus 的 VUE Table 的增强表格控件。提供一些增强功能，如：筛选、导出、远程获取数据。

## 安装

```
npm install vito-table
```

## 示例

  需配合 Element Plus 使用。项目中需要引入 Element Plus 、 Element Icons 及样式文件。多语言使用的 i18n 组件，需全局注册。

1. 引入样式

    ```js
    import "vito-table/dist/index.css";
    ```

1. 导入组件

    ```ts
    import { VitoTable } from "vito-table";
    ```

1. 使用组件

    ```html
    <template>
    	<div>
    		<vito-table :data="data" :columns="columns" />
    	</div>
    </template>
    ```

## 详细说明

[详细说明](https://github.com/Guohui-Peng/vito-table/blob/main/VitoTable.md)

## License

Vito Table is open source softare licensed as MIT.
