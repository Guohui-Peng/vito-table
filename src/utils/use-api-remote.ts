import { useApiFetch } from "./vt-fetch";

import type { VtTable as VT } from "@/types";
import type { Ref } from "vue";

export function useApiRemote(token: string | Ref<string> | null | undefined) {
	/**
	 * 加载远程数据
	 * @param url URL 地址
	 * @param ext_post_data 附加的 PostData
	 * @param page_size 每页显示数量
	 * @param current_page 当前页
	 * @param filters 查询条件
	 * @param sort 排序要求
	 * @returns 返回 Promise
	 */
	const loadRemotePromise = (
		url: string,
		page_size: number,
		current_page: number,
		filters: VT.Filter | undefined = undefined,
		sort: VT.Sort | undefined = undefined,
		ext_post_data: Record<string, any> | null | undefined = undefined
	): Promise<GridResult<any>> => {
		const { apiFetch } = useApiFetch();

		const postData: VT.TableRequstParams = {
			pageSize: page_size,
			currentPage: current_page,
			filters: filters ? JSON.stringify(filters) : undefined
		};
		if (sort && sort.order != null && sort.name != null) {
			postData.sColumn = sort.name;
			postData.sOrder = sort.order === "ascending" ? "asc" : "desc";
		}
		if (!ext_post_data) {
			ext_post_data = {};
		}

		return new Promise((resolve, reject) => {
			try {
				apiFetch<GridResult<any>>(url, token)
					.post({ ...postData, ...ext_post_data })
					.json()
					.then((resp) => {
						resolve(resp.data.value);
					});
			} catch (err) {
				console.error(err);
				reject(err);
			}
		});
	};

	return { loadRemotePromise };
}
