const { Schema, model } = require('mongoose');

const assetSchema = new Schema(
    {
        coin_id: {
            type: String,
            required: true,
            unique: true
        },
        coin_rank: {
            type: String,
            required: String
        },
        coin_symbol: {
            type: String,
            required: true,
            unique: true,
        },
        coin_name: {
            type: String,
            required: true,
            unique: true,
        },
        coin_supply: {
            type: String,
            required: true,
        },
        coin_maxSupply: {
            type: String,
            required: true,
        },
        coin_marketCapUsd: {
            type: String,
            required: true,
        },
        coin_volumeUsd24Hr: {
            type: String,
            required: true,
        },
        coin_priceUsd: {
            type: String,
            required: true,
        },
        coin_changePercent24Hr: {
            type: String,
            required: true,
        },
        coin_vwap24Hr: {
            type: String,
            required: true,
        },
    }
);


const Asset = model('Asset', assetSchema);

module.exports = Asset;