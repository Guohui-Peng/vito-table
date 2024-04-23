import { easyInstall } from "@/utils";
import HeaderFilter from "./src/VtHeaderFilter.vue";

export const VtHeaderFilter = easyInstall(HeaderFilter);
export default VtHeaderFilter;

export * from "./src/filter";
export * from "./src/format";
export * from "./src/instance";
