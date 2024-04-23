import { easyInstall } from "@/utils";

import ExportDialog from "./src/VtExportDialog.vue";

export const VtExportDialog = easyInstall(ExportDialog);

export default easyInstall(VtExportDialog);

export * from "./src/instance";
