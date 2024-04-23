import { easyInstall, easyNoopInstall } from "@/utils";

import Select from "./src/VtSelect.vue";
import TableDialog from "./src/VtTableDialog.vue";

export const VtTableDialog = easyInstall(TableDialog, {
	Select
});

export const VtSelect = easyNoopInstall(Select);

export default VtTableDialog;
