const fetch = require("node-fetch");
const { AuthenticationError } = require('apollo-server-express');
const { User, Wallet, Asset } = require('../models');
const { signToken } = require('../utils/auth');
const { group_assets, extract_coin_data, currency_formatter } = require('../utils/helpers');

const resolvers = {
    Query: {
        // Returns user information based on provided user ID
        getUser: async (parent, { userId }) => {
            return User.findOne({ _id: userId })
                .select('-__v')
        },
        // Method used for dev purposes only - not needed in prod
        getAllUsers: async () => {
            return User.find({})
                .select('-__v')
        },
        // Returns user wallet information based on provided user ID
        // Authorization required 
        getUserWallet: async (parent, { userId }, context) => {
            if (context.user) {
                return Wallet.findOne({ owner: userId })
                    .populate('owner')
                    .populate('coins')
                    .select('-__v')
            }
            console.error('You must be logged in to perform this action');
        },
        // Method used for dev purposes only - not needed in prod
        getAllWallets: async () => {
            return Wallet.find({})
                .populate('owner')
                .select('-__v')
        },
        // Returns top raw data from data source
        getCoinData: async () => {
            const result = [];

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
        // Returns specific coin information based on provided coin ID
        getIndividualCoinData: async (parent, { coinID }) => {
            const URL = `https://api.coincap.io/v2/assets/${coinID}`;

            const response = await fetch(URL);
            const coinData = await response.json();

            const result = {
                coin_id: coinData.data.id,
                coin_rank: coinData.data.rank,
                coin_symbol: coinData.data.symbol,
                coin_name: coinData.data.name,
                coin_supply: coinData.data.supply,
                coin_maxSupply: coinData.data.maxSupply,
                coin_marketCapUsd: coinData.data.marketCapUsd,
                coin_volumeUsd24Hr: coinData.data.volumeUsd24Hr,
                coin_priceUsd: coinData.data.priceUsd,
                coin_changePercent24Hr: coinData.data.changePercent24Hr,
                coin_vwap24Hr: coinData.data.vwap24Hr
            }

            return result;
        },
        // Returns owned quantity, dollar cost average, and total value in USD for a spcific coin in wallet
        // Based on provided user and coin IDs
        // Authorization required 
        aggregateByCoin: async (parent, { userId, coinName }, context) => {
            if (context.user) {
                const wallet = await Wallet.findOne({ owner: userId })
                    .populate('coins')

                const coinsArr = extract_coin_data(wallet.coins)

                // Group by coin as key to the coinsArr array
                const groupByCoin = group_assets(coinsArr, 'coin');

                const singleCoinArr = groupByCoin[`${coinName}`];

                const totalQuantity = singleCoinArr.reduce((sum, currentValue) => {
                    return sum + currentValue.quantity;
                }, 0);

                let runningTotal = 0;

                singleCoinArr.forEach(coin => runningTotal += (coin.quantity * parseFloat(coin.price)));

                const weightedAveragePrice = (runningTotal / totalQuantity);

                let value = totalQuantity * weightedAveragePrice;

                const formattedUSDValue = currency_formatter(value);
                const formattedUSDAveragePrice = currency_formatter(weightedAveragePrice);

                return { coin: coinName, quantity: totalQuantity, dollarCostAveragePrice: formattedUSDAveragePrice, valueUSD: formattedUSDValue }
            }
            console.error('You must be logged in to perform this action');
        },
        // Returns owned quantity, dollar cost average, and total value in USD for all coins in wallet
        // Also returns total USD value of all coins in wallet
        // Based on provided user ID
        // Authorization required 
        aggregateByWallet: async (parent, { userId }, context) => {
            if (context.user) {
                const wallet = await Wallet.findOne({ owner: userId })
                    .populate('coins')

                const coinsArr = extract_coin_data(wallet.coins)

                // Group by coin as key to the coinsArr array
                const groupByCoin = group_assets(coinsArr, 'coin');

                const listOfCoins = [];

                coinsArr.forEach(coin => {
                    if (listOfCoins.includes(coin.coin)) return
                    listOfCoins.push(coin.coin)
                })


                const result = [];
                let walletTotal = 0;

                for (let i = 0; i < listOfCoins.length; i++) {
                    const currentCoin = listOfCoins[i]
                    const individualCoinGroupedByName = groupByCoin[`${currentCoin}`]

                    const totalQuantity = individualCoinGroupedByName.reduce((sum, currentValue) => {
                        return sum + currentValue.quantity;
                    }, 0);

                    let runningTotal = 0;

                    individualCoinGroupedByName.forEach(coin => runningTotal += (coin.quantity * parseFloat(coin.price)));

                    const weightedAveragePrice = (runningTotal / totalQuantity);

                    let value = totalQuantity * weightedAveragePrice;

                    walletTotal += value;

                    const formattedUSDValue = currency_formatter(value);
                    const formattedUSDAveragePrice = currency_formatter(weightedAveragePrice);

                    result.push({ coin: currentCoin, quantity: totalQuantity, dollarCostAveragePrice: formattedUSDAveragePrice, valueUSD: formattedUSDValue })
                }

                const formattedwalletTotal = currency_formatter(walletTotal);

                return { coins: result, walletTotal: formattedwalletTotal };
            }
            console.error('You must be logged in to perform this action');
        },
    },
    Mutation: {
        createUser: async (parent, { input }) => {
            const user = await User.create(input);
            const token = signToken(user);
            const wallet = await Wallet.create({ owner: user._id });

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
        // Saves coin to wallet
        // Authorization required 
        saveCoin: async (parent, { walletID, coinID, quantity }, context) => {
            if (context.user) {
                const URL = `https://api.coincap.io/v2/assets/${coinID}`;

                const response = await fetch(URL);
                const coinData = await response.json();

                const result = {
                    coin_id: coinData.data.id,
                    coin_rank: coinData.data.rank,
                    coin_symbol: coinData.data.symbol,
                    coin_name: coinData.data.name,
                    coin_supply: coinData.data.supply,
                    coin_maxSupply: coinData.data.maxSupply,
                    coin_marketCapUsd: coinData.data.marketCapUsd,
                    coin_volumeUsd24Hr: coinData.data.volumeUsd24Hr,
                    coin_priceUsd: coinData.data.priceUsd,
                    coin_changePercent24Hr: coinData.data.changePercent24Hr,
                    coin_vwap24Hr: coinData.data.vwap24Hr,
                    quantity: quantity
                }

                const newCoin = await Asset.create(result);


                const updatedWallet = await Wallet.findOneAndUpdate(
                    { _id: walletID },
                    { $push: { coins: newCoin } },
                    { new: true, runValidators: true }
                ).populate('owner').populate('coins');

                return updatedWallet;
            }
            console.error('You must be logged in to perform this action');
        },
        // Decreases coin quantity in wallet
        // Remmoves coin from wallet if quantity is <= 0
        // Authorization required 
        deleteCoin: async (parent, { walletID, coinDocumentID, quantityToSubtract }, context) => {
            if (context.user) {
                const currentWallet = await Wallet.find({ _id: walletID }).populate('coins');
                const coin = currentWallet[0].coins.filter(coin => coin._id == coinDocumentID);
                const currentCoinQuantity = coin[0].quantity;
                const newCoinQuantity = currentCoinQuantity - quantityToSubtract;

                // If the new qty is less than 0 remove it from the list
                if (newCoinQuantity <= 0 || currentCoinQuantity == null) {
                    const updatedWallet = await Wallet.findOneAndUpdate(
                        { _id: walletID },
                        { $pull: { coins: { _id: coinDocumentID } } },
                        { new: true }
                    )
                    return updatedWallet;
                }

                // Otherwise just update the new quantity value
                const updatedWallet = await Wallet.findOneAndUpdate(
                    { _id: walletID, "coins._id": coinDocumentID },
                    { $set: { "coins.$.quantity": newCoinQuantity } },
                    { new: true }
                )
                return updatedWallet;
            }
            console.error('You must be logged in to perform this action');
        },
    }
};

module.exports = resolvers;
