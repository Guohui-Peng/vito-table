/**
 * you need to import the some interfaces
 */
import { DefineLocaleMessage, DefineDateTimeFormat, DefineNumberFormat } from "vue-i18n";

declare module "vue-i18n" {
	// define the locale messages schema
	export interface DefineLocaleMessage {
		Common: {
			Login: string;
			Logout: string;
			Back: string;
			NoPermissionAccessPage: string;
			BackHome: string;
			SignInWithOtherAccount: string;
			YouCanDo: string;
		};
		Table: {
			Warning: string;
			OK: string;
			Cancel: string;
			AreYouSureDelete: string;
			AreYouSureDeleteN: string;
			PleaseSelectAtLeastOneRow: string;
			Add: string;
			Edit: string;
			Delete: string;
			Confirm: string;
			Export: string;
			Operations: string;
			Search: string;
			TextFilter: string;
			CustomFilter: string;
			Equals: string;
			Reset: string;
			And: string;
			Or: string;
			equal: string;
			notEqual: string;
			inRange: string;
			notInRange: string;
			lessThan: string;
			lessThanOrEqual: string;
			greaterThan: string;
			greaterThanOrEqual: string;
			contains: string;
			notContains: string;
			beginWith: string;
			notBeginWith: string;
			endsWith: string;
			notEndsWith: string;
			empty: string;
			DateFilter: string;
			TimeFilter: string;
			NumberFilter: string;
			DisplayColumns: string;
			HiddenColumns: string;
			ColumnSelector: string;
			ExportData: string;
			FileType: string;
			All: string;
			CurrentPage: string;
			SelectedRows: string;
			TotalRowsN: string;
			DesignMode: string;
			ColumnDeleteConfirmN: string;
		};
		validations: {
			required: string;
			minlength: string;
			maxlength: string;
		};
	}

	// define the datetime format schema
	export interface DefineDateTimeFormat {
		short: {
			hour: "numeric";
			minute: "numeric";
			second: "numeric";
			timeZoneName: "short";
			timezone: string;
		};
	}

	// define the number format schema
	export interface DefineNumberFormat {
		currency: {
			style: "currency";
			currencyDisplay: "symbol";
			currency: string;
		};
	}
}
