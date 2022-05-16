const { Schema, model, Types } = require('mongoose');

const assetSchema = new Schema(
    {
        coin_id: {
            type: String
        },
        coin_rank: {
            type: String
        },
        coin_symbol: {
            type: String
        },
        coin_name: {
            type: String
        },
        coin_supply: {
            type: String
        },
        coin_maxSupply: {
            type: String
        },
        coin_marketCapUsd: {
            type: String
        },
        coin_volumeUsd24Hr: {
            type: String
        },
        coin_priceUsd: {
            type: String
        },
        coin_changePercent24Hr: {
            type: String
        },
        coin_vwap24Hr: {
            type: String
        },
        quantity: {
            type: Number
        },
    }
);


const Asset = model('Asset', assetSchema);

module.exports = { Asset, assetSchema };