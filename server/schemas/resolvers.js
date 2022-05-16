require('dotenv').config();
const fetch = require("node-fetch");
const { AuthenticationError } = require('apollo-server-express');
const { User, Wallet, Asset } = require('../models');
const { signToken } = require('../utils/auth');
// const accountSid = process.env.TWILIO_ACCOUNT_SID;
// const authToken = process.env.TWILIO_AUTH_TOKEN;
// const client = require('twilio')(accountSid, authToken);
// const { format_business_hours } = require('../utils/helpers');
// const mongo = require('mongoose');

const resolvers = {
    Query: {
        getUser: async (parent, { userId }) => {
            return User.findOne({ _id: userId })
                .select('-__v')
        },
        getUserWallet: async (parent, { userId }) => {
            return Wallet.findOne({ owner: userId })
                .populate('owner')
                .populate('coins')
                .select('-__v')
        },
        getAllWallets: async () => {
            return Wallet.find({})
                .select('-__v')
        },
        getAllUsers: async () => {
            return User.find({})
                .select('-__v')
        },
        getCoinData: async () => {
            const result = [];
            // function to get the raw data
            const URL = "https://api.coincap.io/v2/assets";

            const response = await fetch(URL);
            const coinData = await response.json();

            coinData.data.forEach(coin => {
                const obj = {
                    coin_id: coin.id,
                    coin_rank: coin.rank,
                    coin_symbol: coin.symbol,
                    coin_name: coin.name,
                    coin_supply: coin.supply,
                    coin_maxSupply: coin.maxSupply,
                    coin_marketCapUsd: coin.marketCapUsd,
                    coin_volumeUsd24Hr: coin.volumeUsd24Hr,
                    coin_priceUsd: coin.priceUsd,
                    coin_changePercent24Hr: coin.changePercent24Hr,
                    coin_vwap24Hr: coin.vwap24Hr
                }
                result.push(obj)
            })

            return result;
        },
        getIndividualCoinData: async (parent, { coinID }) => {
            const URL = "https://api.coincap.io/v2/assets";

            const response = await fetch(URL);
            const coinData = await response.json();

            const singleCoin = coinData.data.filter(coin => coin.id === coinID)[0];

            const result = {
                coin_id: singleCoin.id,
                coin_rank: singleCoin.rank,
                coin_symbol: singleCoin.symbol,
                coin_name: singleCoin.name,
                coin_supply: singleCoin.supply,
                coin_maxSupply: singleCoin.maxSupply,
                coin_marketCapUsd: singleCoin.marketCapUsd,
                coin_volumeUsd24Hr: singleCoin.volumeUsd24Hr,
                coin_priceUsd: singleCoin.priceUsd,
                coin_changePercent24Hr: singleCoin.changePercent24Hr,
                coin_vwap24Hr: singleCoin.vwap24Hr
            }

            return result;
        },
    },
    Mutation: {
        createUser: async (parent, { input }) => {
            const user = await User.create(input);
            const token = signToken(user);
            const wallet = await Wallet.create({ owner: user._id });

            console.log(wallet);
            return { token, user, wallet };
        },
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if (!user) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const correctPw = await user.isCorrectPassword(password);

            if (!correctPw) {
                throw new AuthenticationError('Incorrect credentials');
            }

            const token = signToken(user);

            return { token, user };
        },
        saveCoin: async (parent, { walletID, coinID, quantity }) => {
            const URL = "https://api.coincap.io/v2/assets";

            const response = await fetch(URL);
            const coinData = await response.json();

            const singleCoin = coinData.data.filter(coin => coin.id === coinID)[0];

            const result = {
                coin_id: singleCoin.id,
                coin_rank: singleCoin.rank,
                coin_symbol: singleCoin.symbol,
                coin_name: singleCoin.name,
                coin_supply: singleCoin.supply,
                coin_maxSupply: singleCoin.maxSupply,
                coin_marketCapUsd: singleCoin.marketCapUsd,
                coin_volumeUsd24Hr: singleCoin.volumeUsd24Hr,
                coin_priceUsd: singleCoin.priceUsd,
                coin_changePercent24Hr: singleCoin.changePercent24Hr,
                coin_vwap24Hr: singleCoin.vwap24Hr,
                quantity: quantity
            }

            const newCoin = await Asset.create(result);

            console.log(newCoin)

            const updatedWallet = await Wallet.findOneAndUpdate(
                { _id: walletID },
                { $push: { coins: newCoin } },
                { new: true, runValidators: true }
            ).populate('owner').populate('coins');

            return updatedWallet;
        },
        deleteCoin: async (parent, { walletID, coinID, quantityToSubtract }) => {
            const currentWallet = await Wallet.find({ _id: walletID }).populate('coins');
            const coin = currentWallet[0].coins.filter(coin => coin._id == coinID);
            const currentCoinQuantity = coin[0].quantity;
            const newCoinQuantity = currentCoinQuantity - quantityToSubtract;

            if (newCoinQuantity <= 0) {
                const updatedWallet = await Wallet.findOneAndUpdate(
                    { _id: walletID },
                    { $pull: { coins: { _id: coinID } } },
                    { new: true }
                )
                return updatedWallet;
            }

            const updatedWallet = await Wallet.findOneAndUpdate(
                { _id: walletID, "coins._id": coinID },
                { $set: { "coins.$.quantity": newCoinQuantity } },
                { new: true }
            )
            return updatedWallet;


        },
    }
};

module.exports = resolvers;
