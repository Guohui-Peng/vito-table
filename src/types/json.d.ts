type TranslatePair = typeof Record<string, string | string[] | TranslatePair>;

declare module "*.json" {
	const value: TranslatePair;
	export default value;
}
