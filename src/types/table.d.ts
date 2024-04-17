import type { BookType } from "xlsx";

declare namespace VtTable {
	// #region Filter
	/**
	 * 搜索操作
	 */
	type FilterOperation =
		| "eq"
		| "ne"
		| "lt"
		| "le"
		| "gt"
		| "ge"
		| "bw"
		| "bn"
		| "in"
		| "ni"
		| "ew"
		| "en"
		| "cn"
		| "nc";
	/**
	 * 分组操作
	 */
	type GroupOperation = "and" | "or";

	interface Rule {
		/**
		 * 操作
		 */
		op: FilterOperation;
		/**
		 * 字段
		 */
		field: string;
		/**
		 * 数据
		 */
		data: any;
	}

	interface Filter {
		/**
		 * 操作
		 */
		groupOp: GroupOperation;
		/**
		 * 分组
		 */
		groups?: Filter[];
		/**
		 * 规则
		 */
		rules: Rule[];
	}
	// #endregion

	/**
	 * 排序方式
	 */
	type SortOrderType = "asc" | "desc" | "ascending" | "descending";

	/**
	 * 字段排序
	 */
	interface Sort {
		/**
		 * 排序字段
		 */
		name: string;
		/**
		 * 排序方向
		 */
		order: SortOrderType;
	}

	interface TableRequstParams {
		/**
		 * 当前页码
		 */
		currentPage: number;
		/**
		 * 每页记录数
		 */
		pageSize: number;
		/**
		 * 查询条件
		 */
		filters?: string;
		/**
		 * 排序
		 */
		sOrder?: "asc" | "desc";
		/**
		 * 排序字段
		 */
		sColumn?: string;
	}

	/**
	 * 导出范围。"a"：所有数据；"c"：当前页数据；"s"：选中数据
	 */
	type ExportRangeType = "a" | "c" | "s";

	/**
	 * 表格支持的日期时间类型
	 */
	type TableDateTimeType =
		| "date"
		| "datetime"
		| "datetime-m"
		| "datetime-h"
		| "time"
		| "time-m"
		| "time-h";
	/**
	 * 日期类型，用于ELementUI的日期选择器
	 */
	type DateType = "date" | "datetime";
	/**
	 * 日期时间类型
	 */
	type DateTimeType = DateType | "time";
	// /**
	//  * 通用数据类型
	//  */
	// type CommonDataType = "text" | "textarea" | "number" | "int" | "boolean" | DateTimeType;
	/**
	 * 列支持的数据类型。
	 * 除了通用数据类型外，还支持select、link、html等类型
	 * html和link类型不支持编辑，只支持显示。在formatoptions中定义html元素。
	 * 例：{ formatoptions: { custom: "<span>123</span>" } }，
	 * 公式：{ formatoptions: { custom: (row, column, cellValue, index) => {
	 *							return (
	 *								'<a href="/test?a=' + row.TableCount + "\">" + row.Name + "</a>"
	 *							);
	 *						} } }
	 */
	type ColumnDataType =
		| "text"
		| "textarea"
		| "number"
		| "int"
		| "integer"
		| "select"
		| "boolean"
		| "link"
		| "html"
		| TableDateTimeType;

	// #region FormatOption
	/**
	 * 列格式化选项
	 */
	type CustomFormatOptionType = {
		number: {
			/**
			 * 小数位数
			 */
			decimalPlaces?: number;
			/**
			 * 千分位分隔符
			 */
			thousandsSeparator?: string;
			/**
			 * 小数点分隔符
			 */
			decimalSeparator?: string;
		};
		int: {
			/**
			 * 千分位分隔符
			 */
			thousandsSeparator?: string;
		};
		integer: {
			/**
			 * 千分位分隔符
			 */
			thousandsSeparator?: string;
		};
		datetime: {
			/**
			 * 日期时间格式
			 */
			datetimeFormat?: string;
		};
		"datetime-m": {
			/**
			 * 日期时间格式
			 */
			datetimeFormat?: string;
		};
		"datetime-h": {
			/**
			 * 日期时间格式
			 */
			datetimeFormat?: string;
		};
		date: {
			/**
			 * 日期格式
			 */
			datetimeFormat?: string;
		};
		time: {
			/**
			 * 时间格式
			 */
			timeFormat?: string;
		};
		"time-m": {
			/**
			 * 时间格式
			 */
			timeFormat?: string;
		};
		"time-h": {
			/**
			 * 时间格式
			 */
			timeFormat?: string;
		};
		link: {
			/**
			 * 链接目标
			 */
			target?: "_self" | "_blank";
			/**
			 * 链接地址
			 */
			url?: string;
		};
		select: {
			/**
			 * 选项列表
			 */
			options?: any[] | string;
			/**
			 * 选项值字段
			 */
			valueKey?: string;
			/**
			 * 选项名称字段
			 */
			labelKey?: string;
			/**
			 * 远程数据源
			 */
			dataUrl?: string;
		};
		currency: {
			/**
			 * 前置符号
			 */
			prefix?: string;
			/**
			 * 小数位数
			 */
			decimalPlaces?: number;
			/**
			 * 千分位分隔符
			 */
			thousandsSeparator?: string;
			/**
			 * 小数点分隔符
			 */
			decimalSeparator?: string;
		};
		// custom: {
		// 	/**
		// 	 * 自定义格式化函数
		// 	 */
		// 	fn: Function;
		// };
	};

	interface CommonFormatOption {
		defaultValue?: string | number | Date | boolean;
		/**
		 * 自定义格式化函数
		 */
		custom?: Function | string;
	}

	type FormatOptionType = keyof CustomFormatOptionType | ColumnDataType;

	type FormatOption<T extends FormatOptionType> = T extends keyof CustomFormatOptionType
		? CommonFormatOption & CustomFormatOptionType[T]
		: CommonFormatOption;
	// #endregion

	// #region EditOption
	type EditOptionCustomType = {
		text: {
			/**
			 * 最大长度
			 */
			maxlength?: number;
		};
		textarea: {
			/**
			 * 最大长度
			 */
			maxlength?: number;
			/**
			 * 行数
			 */
			rows: number;
		};
		number: {
			/**
			 * 最小值
			 */
			min?: number;
			/**
			 * 最大长度
			 */
			max?: number;
			/**
			 * 小数位数
			 */
			decimalPlaces?: number;
		};
		int: {
			/**
			 * 最小值
			 */
			min?: number;
			/**
			 * 最大长度
			 */
			max?: number;
		};
		select: {
			/**
			 * 选项列表
			 */
			options?: any[] | string;
			/**
			 * 选项值字段
			 */
			valueKey?: string;
			/**
			 * 选项名称字段
			 */
			labelKey?: string;
			/**
			 * 远程数据源
			 */
			dataUrl?: string;
		};
	};

	type EditOptionType = keyof EditOptionCustomType | ColumnDataType;

	interface CommonEditOption {
		/**
		 * 编辑时隐藏
		 */
		edithidden?: boolean;
		/**
		 * 编辑时是否必填
		 */
		required?: boolean;
		/**
		 * 编辑时默认值
		 */
		defaultValue?: string | number | Date | boolean;
		/**
		 * 编辑时是否禁用
		 */
		disabled?: boolean;
		// /**
		//  * 自定义编辑属性
		//  */
		// custom?: EditOptionCustomType[T];
	}

	type EditOption<T extends EditOptionType> = T extends keyof EditOptionCustomType
		? CommonEditOption & EditOptionCustomType[T]
		: CommonEditOption;
	// #endregion

	/**
	 * 编辑规则
	 */
	interface EditRule {
		/**
		 * 编辑时隐藏
		 */
		edithidden?: boolean;
		/**
		 * 编辑时是否必填
		 */
		required?: boolean;
		/**
		 * 为true时，检查是否为number类型
		 */
		number?: boolean;
		/**
		 * 为true时，检查是否为integer类型
		 */
		integer?: boolean;
		/**
		 * 检查数值的最小值，当为number类型时有效
		 */
		minValue?: number;
		/**
		 * 检查数值的最大值，当为number类型时有效
		 */
		maxValue?: number;
		/**
		 * 检查是否Email地址
		 */
		email?: boolean;
		/**
		 * 检查是否合法的URL
		 */
		url?: boolean;
		/**
		 * 检查是否日期类型
		 */
		date?: boolean;
		/**
		 * 检查是否时间类型
		 */
		time?: boolean;
	}

	/**
	 * jqGrid 列定义，为了兼容 jqGrid 的 colModel
	 */
	interface JqGridColumn<T extends ColumnDataType> {
		/**
		 * 是否允许编辑
		 */
		editable?: boolean;
		/**
		 * jqGrid属性，未使用
		 */
		edittype?: T;
		/**
		 * 编辑属性定义
		 */
		editoptions?: EditOption<T>;
		/**
		 * 编辑规则
		 */
		editrules?: EditRule;
		// /**
		//  * 是否隐藏
		//  */
		// hidden?: boolean;
		/**
		 * 搜索选项
		 */
		searchoptions?: any;
		/**
		 * 搜索显示类型，为空时与字段类型相同
		 */
		sType?: T;
		/**
		 * 列格式化定义
		 */
		formatoptions?: FormatOption<T>;
		/**
		 * 自定义列格式化函数
		 */
		formatter?: boolean;
	}

	interface IColumn {
		/**
		 * ID
		 */
		id?: string;
		/**
		 * 列数据字段
		 */
		dataKey: string;
		/**
		 * 列数据类型
		 */
		dataType: ColumnDataType;
		/**
		 * 列 Key
		 */
		key: string;
		/**
		 * 列标题
		 */
		title: string;
		/**
		 * 列宽度
		 */
		width?: number | string;
		/**
		 * 列宽度
		 */
		minWidth?: number | string;
		/**
		 * 是否允许搜索
		 */
		search?: boolean;
		/**
		 * 是否允许排序
		 */
		sortable?: boolean;
		/**
		 * 附加属性定义
		 */
		attrs?: Object;
		/**
		 * 是否隐藏
		 */
		hidden?: boolean;
	}

	/**
	 * 表格列定义
	 */
	interface Column<T extends IColumn["dataType"]> extends JqGridColumn<T>, IColumn {}

	// #region Attributes
	type ColumnAttributeName<T extends ColumnDataType> = keyof Column<T>;
	type EditOptionAttributeName<T extends EditOptionType> = keyof EditOption<T>;
	type SearchOptionAttributeName<T extends EditOptionType> = keyof EditOption<T>;
	type FormatOptionAttributeName<T extends EditOptionType> = keyof FormatOption<T>;

	type AttributeType = "boolean" | "text" | "select" | "textarea" | "number" | "int";
	type MoreAttributeType = "editoptions" | "searchoptions" | "formatoptions";

	type CustomColumnAttributeType = {
		select: {
			/**
			 * select类型的选项列表
			 */
			options: any[];
		};
		boolean: {
			/**
			 * 更多配置
			 */
			more?: MoreAttributeType;
		};
	};

	type CommonColumnAttributeType = {
		/**
		 * 名称
		 */
		name: string;
		/**
		 * 类型
		 */
		type: AttributeType;
		/**
		 * 提示
		 */
		tooltip?: string;
		/**
		 * 默认值，undefined时不设置默认值
		 */
		default?: any;
		/**
		 * 在显示及定义中是否排除，排除后可以另外单独处理
		 */
		exclude?: boolean;
		/**
		 * 是否必须
		 */
		required?: boolean;
	};

	/**
	 * 列属性
	 */
	type ColumnAttribute<T extends ColumnDataType> = T extends keyof CustomColumnAttributeType
		? CommonColumnAttributeType & CustomColumnAttributeType[T]
		: CommonColumnAttributeType;
	// #endregion

	// #region Export to excel
	/**
	 * 表格导出Excel的参数
	 */
	interface Table2ExcelParams {
		/**
		 * 表格数据
		 */
		data: any[];
		/**
		 * 表格列
		 */
		columns: IColumn[];
		/**
		 * 导出的文件名称
		 */
		filename: string;
		/**
		 * 导出的Sheet名称
		 */
		sheetName: string;
		/**
		 * 是否自动调整列宽
		 */
		autoWidth: boolean;
		/**
		 * 导出的文件类型
		 */
		type: BookType;
		/**
		 * 合并单元格
		 */
		merges: any[];
		/**
		 * 列最大宽度
		 */
		colMaxWidth: number;
		/**
		 * 页脚
		 */
		footer: any[];
		/**
		 * 带计算公式的页脚
		 */
		formulaFooter: any[];
	}

	interface Json2ExcelParams {
		rows: any[];
		header: string[] | string[][];
		filename: string;
		sheetName: string;
		autoWidth: boolean;
		type: BookType;
		merges: any[];
		colMaxWidth: number;
		footer: any[];
		formulaFooter: any[];
	}
	// #endregion

	/**
	 * 过滤行
	 */
	interface FilterRowFunc {
		/**
		 *
		 */
		(row: any, filter: Filter): boolean;
	}

	// #region FilterMoreButton
	type FilterMoreMenuItemSpecialType = {
		button: {
			key: FilterOperation | "CustomFilter";
			text: string;
		};
	};

	type FilterMoreMenuItemType = keyof FilterMoreMenuItemSpecialType | "divider";

	interface FilterMoreMenuItemCommon<T extends FilterMoreMenuItemType> {
		checked?: boolean;
		type: T;
	}

	type FilterMoreMenuItem<T extends FilterMoreMenuItemType> =
		T extends keyof FilterMoreMenuItemSpecialType
			? FilterMoreMenuItemCommon<T> & FilterMoreMenuItemSpecialType[T]
			: FilterMoreMenuItemCommon<T>;
	// #endregion

	interface SummaryMethod {
		columns: TableColumnCtx<any>[];
		data: any[];
	}

	interface EditRowParams {
		row: any;
	}

	interface SortChangeParams {
		column: TableColumnCtx;
		prop: string;
		order: SortOrderType;
	}
}
