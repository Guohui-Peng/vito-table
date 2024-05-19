# Vito Table

对 Element Plus 的 Virtual Table 进行封装，方便使用。

## 文档

### Table 属性

1.  `remote` 为是否远程加载数据，为 true 时，需要配置 `url` 属性。

1.  `url` 为远程加载数据的地址。远程地址应支持 post 方式，且使用 json 格式。

    -   请求参数

        -   `currentPage` 为当前页码，从 1 开始。

        -   `pageSize` 为每页显示的记录数。

        -   `filters` 为筛选条件，由 table 筛选后自动生成 。

1. `editPostData` 为编辑时增加到请求参数中的数据。

1. `searchPostData` 为查询时增加到请求参数中的数据。

1.  `editUrl` 为远程修改地址。远程地址应支持 post 方式，且使用 json 格式。并根据以下参数实现相关功能。

    -   请求参数

        -   `operation` 操作类型。

            -   `add` : 新增一行数据。

            -   `edit` : 修改数据。

            -   `del` : 删除数据。配合 `ids` 参数可批量删除。

        -   `data` 修改的数据。当操作类型不是 `del` 时，必须提供此字段。

        -   `ids` 批量ID。用于批量删除。仅操作类型为 `del` 时有效。

1.  `columns` 为列定义，详见 [列定义](#列定义) 。

1.  `v-model` 当 `remote` 为 false 时，使用此绑定本地数据。

1.  `pageSizes` 为每页显示的记录数选项，格式为 `[100, 200, 300, 400]` 。

1.  `pageSize` 为每页显示的记录数，当 `pageSizes` 为空时，此属性无效。

1.  `height` 为表格高度，当 `height` 为空时，表格高度为 705。

1.  `showPagination` 为是否显示翻页栏，默认为 true 。

1.  `showOperationColumn` 是否显示操作列，默认为 true 。为 false 时不显示操作列。

1.  `showRowEditButton` 为是否显示行内编辑按钮，默认为 true 。需 `showOperationColumn` 为 true 时才能有效。

1.  `showRowDeleteButton` 为是否显示行内删除按钮，默认为 true 。需 `showOperationColumn` 为 true 时才能有效。

1.  `showColumnsSelection` 为是否显示列选择按钮，默认为 true 。用于定义显示的列以及隐藏的列。

1.  `showFooterRow` 为是否显示表格底部合计行，默认为 false 。（仅V1版本支持）

1.  `userDataOnFooter` 为是否在底部合计行显示用户自定义数据，默认为 false 。需 `showFooterRow` 为 true 时才能有效。（仅V1版本支持）

1.  `userFooterData` 为用户自定义数据，需 `userDataOnFooter` 为 true 时才能有效。（仅V1版本支持）

1.  `exportFooter` 为是否导出底部合计行，默认为 true 。

1.  `exportFormulaFooter` 为是否导出公式底部合计行，可对指定列进行汇总、平均等公式计算，显示在数据行末尾。需 `exportFooter` 为 true 时才能有效。示例如下：

    ```js
    const formulaFooter = [
    	{
    		"column-0": "Total",
    		"column-4": { t: "n", f: "SUM", z: "#,##0" },
    		"column-5": { t: "n", f: "SUM", z: "#,##0.000" }
    	}
    ];
    ```

1.  `exportCustomFooter` 为是否导出自定义底部合计行。需 `exportFooter` 为 true 时才能有效。示例如下：

    ```js
    const footerData = [
    	{
    		"column-0": "合计",
    		"column-1": "测试",
    		"column-4": 1000,
    		"column-5": 100.0,
    		"column-6": "此行为日期"
    	}
    ];
    ```

1.  `exportFilename` 为导出文件名，默认为 `export-file` 。


1. `columnTitleI18n` 为 true 时列标题默认使用翻译功能，为 false 关闭。


### 列定义

1. `title` 为列显示的名称，编辑时显示为字段名称。

1. `dataKey` 为数据的字段名称。表格显示的对应 cell 根据 dataKey 从行数据中取值。

1. `editable` 可编辑选项，默认为 true 。当设置为 false 时，编辑时不显示此字段。

1. `editoptions` 编辑选项。

    - `readonly` 此项在编辑时为只读状态。默认为 false 。

    - `disabled` 此项在编辑时为禁用状态。默认为 false 。

    - `rows` 当 `type` 为 `textarea` 时，可设置行数。

    - `value` 当 `type` 为 `select` 时，可设置下拉选项。格式为 `[{ label: "选项1", value: "1" }]` 或者 `"选项1:1;选项2:2"` 。

    - `defaultValue` 为默认值。当 `type` 为 `select` 时，可设置默认选中项。

    - `dataUrl` 当 `type` 为 `select` 时，可配置远程获取选项的 url 地址。

1. `search` 为是否可搜索。默认为 true 。当设置为 false 时，不显示此字段的搜索框。

1. `searchoptions` 编辑选项。

    - `value` 当 `type` 为 `select` 时，可设置下拉选项。格式为 `[{ label: "选项1", value: "1" }]` 或者 `"选项1:1;选项2:2"` 。

    - `defaultValue` 为默认值。当 `type` 为 `select` 时，可设置默认选中项。

    - `dataUrl` 当 `type` 为 `select` 时，可配置远程获取选项的 url 地址。

1. `dataType` 为列字段的类型。当前支持以下类型：

    - `text` 为文本类型，编辑时显示为文本输入框。

    - `textarea` 为文本域，编辑时显示为2行的文本域输入框。

    - `number` 为数字型，编辑时显示为数字编辑框。

    - `int` 为整型，编辑时显示为数字编辑框。

    - `date` 为日期型，编辑时显示为日期选择框。显示格式：2021-01-01

    - `datetime` 为日期时间型，编辑时显示为日期时间选择框。显示格式：2021-01-01 12:00:00

    - `datetime-m` 为日期时间型，编辑时显示为日期时间选择框。此类型的日期时间不显示秒。显示格式：2021-01-01 12:00

    - `datetime-h` 为日期时间型，编辑时显示为日期时间选择框。此类型的时间只显示小时。显示格式：2021-01-01 12

    - `time` 为时间型， 编辑时显示为时间选择框。显示格式：12:00:00

    - `time-m` 为时间型， 编辑时显示为时间选择框。此类型的时间不显示秒。显示格式：12:00

    - `time-h` 为时间型， 编辑时显示为时间选择框。此类型的时间只显示小时。显示格式：12

    - `select` 为选择框，编辑时显示下拉选择框。使用此类型时应该提供 editoptions 、 searchoptions 选项

    - `link` 为链接类型，编辑时显示为链接输入框。在formatoptions里定义显示的 html 。示例参考 `html` 。

    - `html` 为HTML类型，编辑时显示为HTML输入框。在formatoptions里定义显示的 html 。示例：

    ```ts
    ...,
    formatter: true,
    formatoptions: {
        custom: (row, column, cellValue, index) => {
            return (
                '<a href="/test?a=' + row.TableCount + '\">' + row.Name + '</a>'
            );
        }
    }
    ```

1. `sType` 为搜索类型，选项同 `dataType` ，为空时同 `dataType` 。

1. `editType` 为编辑类型，选项同 `dataType` ，为空时同 `dataType` 。

1. `formatoptions` 格式化选项。

    - `decimalPlaces` 为小数位数。仅当 `type` 为 `number` 时有效。

1. `hidden` 为是否隐藏列。默认为 false 。当设置为 true 时，不显示此列。

1. `formatter` 自定义格式化函数。

    - 传入参数参考 [Virtual Table](https://element-plus.org/zh-CN/component/table-v2.html#typings) 的 CellRenderProps，如下：

    ```ts
    type CellRenderProps<T> = {
    	cellData: T;
    	column: Column<T>;
    	columns: Column<T>[];
    	columnIndex: number;
    	rowData: any;
    	rowIndex: number;
    };
    ```

    - 示例：

    ```ts
    formatter: ({ cellData }) => {
    	return cellData ? "是" : "否";
    };
    ```

1. 更多属性，支持 Element Plus 的 [Table Column Attributes](https://element-plus.org/zh-CN/component/table-v2.html##column-属性) 。

### 插槽

1. `pagination` 用于定义翻页栏内容，将添加在新增、删除按钮之后，翻页之前的位置。

    - 参数 `selectedRows` 为已选择的表格数据行。用法示例如下：

    ```html
    <template v-slot:pagination="{ selectedRows }"> 已选择：{{ selectedRows.length }} 行 </template>
    ```

1. `moreRowButtons` 为自定义行内按钮，用于扩展行内按钮。需 `showOperationColumn` 为 true 时才能有效。示例：

    ```html
    <template v-slot:moreRowButtons="{ row }">
    	<el-button type="text" @click="handleMoreRowButton(row)">更多</el-button>
    </template>
    ```

1. `morePageButtons` 为自定义底部按钮，用于扩展底部按钮。示例：

    ```html
    <template v-slot:morePageButtons="{ selectedRows }">
    	<el-button type="text" @click="handleMorePageButton(selectedRows)">更多</el-button>
    </template>
    ```

## 子组件

1. `VtStringFilter` 用于文本列的查询。

    - 属性

        - `column` 为列定义，用于获取字段相关定义。

        - `defaultFilter` 为默认的筛选条件，用于初始化筛选条件。

    - 事件

        - `onFiltered` 为筛选完成后的回调函数，用于将筛选条件传递给父组件。

1. `VtStringFilterMore` 用于自定义筛选条件。

    - 属性

        - `v-model:show` 是否显示对话框。

        - `v-model:filter` 绑定筛选条件。

        - `field` 绑定的字段名称，用于组合成查询条件，一般为列的 `dataKey` ，应与数据库的字段名称一致。

        - `field-name` 字段的显示名称，一般与列的 `title` 相同。

    - 事件

        - `onFiltered` 为筛选完成后的回调函数，用于将筛选条件传递给父组件。

1. `VtNumberFilter` 用于数值列的查询。属性及事件同 `VtStringFilter` 。

1. `VtTimeFilter` 用于时间列的查询。属性及事件同 `VtStringFilter` 。

1. `VtDatetimeFilter` 用于时间列的查询。

    - 属性

        - `column` 为列定义，用于获取字段相关定义。

        - `defaultFilter` 为默认的筛选条件，用于初始化筛选条件。

        - `type` 为时间类型，可选值为 `date` 、 `datetime` 。

    - 事件

        - `onFiltered` 为筛选完成后的回调函数，用于将筛选条件传递给父组件。
