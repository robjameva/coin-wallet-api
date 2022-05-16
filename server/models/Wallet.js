const { Schema, model } = require('mongoose');
const { assetSchema } = require('./Asset');

const walletSchema = new Schema(
    {
        coins: [assetSchema],
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    }
)

const Wallet = model('Wallet', walletSchema);

module.exports = Wallet;
