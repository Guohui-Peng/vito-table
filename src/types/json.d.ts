type TranslatePair = {
	[key: string]: string | string[] | TranslatePair;
};

declare module "*.json" {
	const value: TranslatePair;
	export default value;
}
