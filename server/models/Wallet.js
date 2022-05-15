const { Schema, model } = require('mongoose');

const walletSchema = new Schema(
    {
        assets: {
            type: Schema.Types.ObjectId,
            ref: 'Asset'
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        }
    }
)

const Wallet = model('Wallet', walletSchema);

module.exports = { Wallet, walletSchema };
