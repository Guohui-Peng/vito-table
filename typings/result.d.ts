/**
 * @description 返回结果
 */
interface Result<T = any> {
	/**
	 * 是否成功
	 */
	success: boolean;
	/**
	 * 返回数据
	 */
	data?: T | null;
	/**
	 * 返回消息
	 */
	msg?: string;
}

/**
 * 表格返回结果
 */
interface GridResult<T = any> {
	/**
	 * 总数
	 */
	total: number;
	/**
	 * 数据
	 */
	rows: T[];
	/**
	 * 当前页
	 */
	page: number;
	/**
	 * 每页数量
	 */
	records: number;
	/**
	 * Footer数据
	 */
	userdata?: Record<string, any>;
}
