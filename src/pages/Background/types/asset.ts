/**
 * Metadata for a given asset, as well as the one or more token lists that
 * provided that metadata.
 *
 * Note that the metadata is entirely optional.
 */
export type AssetMetadata = {
  logoURL?: string;
  websiteURL?: string;
};

/**
 * The name and symbol of an arbitrary asset, fungible or non-fungible,
 * alongside potential metadata about that asset.
 */
export type Asset = {
  symbol: string;
  name: string;
  metadata?: AssetMetadata;
};

/*
 * A union of all assets we expect to price.
 */
export type AnyAsset = Asset;

/*
 * The primary type representing amounts in fungible asset transactions.
 */
export type AnyAssetAmount<T extends AnyAsset = AnyAsset> = {
  asset: T;
  amount: string;
};
