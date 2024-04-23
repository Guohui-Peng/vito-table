import { easyInstall, easyNoopInstall } from "@/utils";

import ColumnSelector from "./src/VtColumnSelector.vue";
import Transfer from "./src/VtTransfer.vue";

export const VtColumnSelector = easyInstall(ColumnSelector, {
	Transfer
});

export const VtTransfer = easyNoopInstall(Transfer);

export default VtColumnSelector;
