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
            required: Number
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
            type: Number,
            required: true,
        },
        coin_maxSupply: {
            type: Number,
            required: true,
        },
        coin_marketCapUsd: {
            type: Number,
            required: true,
        },
        coin_volumeUsd24Hr: {
            type: Number,
            required: true,
        },
        coin_priceUsd: {
            type: Number,
            required: true,
        },
        coin_changePercent24Hr: {
            type: Number,
            required: true,
        },
        coin_vwap24Hr: {
            type: Number,
            required: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
    }
);


const Asset = model('Asset', assetSchema);

module.exports = Asset;