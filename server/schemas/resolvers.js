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
    // getRestaurant: async (parent, { restaurantId }) => {
    //     const restaurant = await Restaurant.findOne({ _id: restaurantId })
    //         .select('-__v')

    //     const reservations = await Reservation.aggregate([
    //         // Stage 1: Filter reservations by restaurant id
    //         {
    //             $match: { restaurant: restaurant._id }
    //         },
    //         // Stage 2: Group remaining documents by timeslot and calculate total quantity
    //         {
    //             $group: { _id: "$time_slot", totalQuantity: { $sum: "$party_size" } }
    //         }
    //     ])

    //     const openHour = parseInt(restaurant.business_hours_open)
    //     const closeHour = parseInt(restaurant.business_hours_close)
    //     const operatingHours = []
    //     const fullHours = []

    //     for (let i = openHour; i < closeHour + 1; i++) {
    //         operatingHours.push(i)
    //     }

    //     reservations.forEach(hour => {
    //         if (hour.totalQuantity > restaurant.occupancy) fullHours.push(hour._id);
    //     })

    //     const unformattedAvailableHours = operatingHours.filter(item => !fullHours.includes(item));

    //     const formattedHours = format_business_hours(unformattedAvailableHours)

    //     return { restaurant, hours: formattedHours }
    // },
    // getAllRestaurants: async () => {
    //     const restaurants = await Restaurant.find({})
    //         .select('-__v')

    //     return restaurants
    // },
    // getRestaurantsByOwner: async (parent, { ownerID }) => {
    //     const restaurants = await Restaurant.find({ owner: { _id: ownerID } })
    //         .select('-__v')

    //     return restaurants
    // },
    // getReservationsByUser: async (parent, { userID }) => {
    //     const reservation = await Reservation.find({ user: { _id: userID } })
    //         .select('-__v')
    //         .populate('restaurant')
    //         .populate('user')

    //     return reservation
    // },
    // getReservationsByRestaurant: async (parent, { restaurantID }) => {
    //     return Reservation.find({ restaurant: { _id: restaurantID } })
    //         .select('-__v')
    //         .populate('user')
    // },
    // getReservationsByOwner: async (parent, { ownerID }) => {
    //     const reservation = await Reservation.find({})
    //         .select('-__v')
    //         .populate('restaurant')
    //         .populate('user')

    //     return reservation.filter(reservation => reservation.restaurant.owner._id == ownerID)
    // },


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
        saveCoin: async (parent, { walletID, coinID }) => {
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

            const newCoin = await Asset.create(result);

            console.log(newCoin)

            const updatedWallet = await Wallet.findOneAndUpdate(
                { _id: walletID },
                { $push: { coins: newCoin } },
                { new: true, runValidators: true }
            ).populate('owner').populate('coins');



            return updatedWallet;
        },
        deleteCoin: async (parent, { walletID, coinID }) => {
            const updatedWallet = await Wallet.findOneAndUpdate(
                { _id: walletID },
                { $pull: { coins: { _id: coinID } } },
                { new: true }
            )

            return updatedWallet;
        },
        // createRestaurant: async (parent, { input }) => {
        //     const restaurant = await Restaurant.create(input);

        //     return restaurant;
        // },
        // createReservation: async (parent, { input }) => {
        //     const reservation = await Reservation.create(input);
        //     const newReservation = await Reservation.find({ _id: reservation._id }).populate('user').populate('restaurant');

        //     const businessName = newReservation[0].restaurant.business_name;
        //     const party = newReservation[0].party_size;
        //     const timeSlot = format_business_hours([newReservation[0].time_slot])[0];
        //     const firstName = newReservation[0].user.first_name;
        //     const phoneNumber = newReservation[0].user.phone_number;

        //     client.messages
        //         .create({
        //             body:
        //                 `Hello ${firstName}, your table is confirmed at ${businessName} for ${party} people at ${timeSlot}.`,
        //             from: '+17853776055',
        //             to: `+1${phoneNumber}`
        //         })

        //     return reservation;
        // },
        // updateReservation: async (parent, { input }) => {
        //     const updatedReservation = await Reservation.findOneAndUpdate(
        //         { _id: input.reservationID },
        //         input,
        //         { new: true, runValidators: true }
        //     ).populate('user').populate('restaurant')

        //     const businessName = updatedReservation.restaurant.business_name;
        //     const party = updatedReservation.party_size;
        //     const timeSlot = format_business_hours([updatedReservation.time_slot])[0];
        //     const firstName = updatedReservation.user.first_name;
        //     const phoneNumber = updatedReservation.user.phone_number;

        //     client.messages
        //         .create({
        //             body:
        //                 `Hello ${firstName}, your reservation has been updated at ${businessName} for ${party} people at ${timeSlot}.`,
        //             from: '+17853776055',
        //             to: `+1${phoneNumber}`
        //         })

        //     return updatedReservation
        // },
        // updateRestaurant: async (parent, { input }) => {
        //     const updatedRestaurant = await Restaurant.findOneAndUpdate(
        //         { _id: input._id },
        //         input,
        //         { new: true, runValidators: true }
        //     );

        //     return updatedRestaurant
        // },
        // updateUser: async (parent, { input }) => {
        //     const updatedUser = await User.findOneAndUpdate(
        //         { _id: input._id },
        //         input,
        //         { new: true, runValidators: true }
        //     );

        //     return updatedUser;
        // },
        // deleteUser: async (parent, { _id }) => {
        //     const user = await User.findOneAndDelete({ _id })

        //     return user;
        // },
        // deleteReservation: async (parent, { _id }) => {
        //     const reservation = await Reservation.findOneAndDelete({ _id })

        //     return reservation;
        // },
        // deleteAllReservations: async () => {
        //     const reservation = await Reservation.deleteMany({})

        //     return reservation;
        // },
        // deleteAllRestaurants: async () => {
        //     const restaurant = await Restaurant.deleteMany({})

        //     return restaurant;
        // },
        // deleteAllUsers: async () => {
        //     const user = await User.deleteMany({})

        //     return user;
        // },
        // deleteRestaurant: async (parent, { _id }) => {
        //     const restaurant = await Restaurant.findOneAndDelete({ _id })

        //     return restaurant;
        // },
    }
};

module.exports = resolvers;
