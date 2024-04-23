import { easyInstall, easyNoopInstall } from "@/utils";
import SelectCell from "./src/VtSelectCell.vue";
import Cell from "./src/VtCell.vue";

export const VtCell = easyInstall(Cell, { SelectCell });

export const VtSelectCell = easyNoopInstall(SelectCell);

export default VtCell;

export * from "./src/instance";
