const { Schema, model } = require('mongoose');

const walletSchema = new Schema(
    {
        wallet_id: {
            type: Schema.Types.ObjectId
        },
        assets: {
            type: Schema.Types.ObjectId,
            ref: 'Asset'
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    }
)

const Wallet = model('Wallet', walletSchema);

module.exports = Wallet;
