require('dotenv').config();
const { AuthenticationError } = require('apollo-server-express');
const { User, Restaurant, Reservation } = require('../models');
const { signToken } = require('../utils/auth');
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const client = require('twilio')(accountSid, authToken);
const { format_business_hours } = require('../utils/helpers');
const mongo = require('mongoose');

const resolvers = {
    Query: {
        getUser: async (parent, { userId }) => {
            return User.findOne({ _id: userId })
                .select('-__v')
        },
        getRestaurant: async (parent, { restaurantId }) => {
            const restaurant = await Restaurant.findOne({ _id: restaurantId })
                .select('-__v')

            const reservations = await Reservation.aggregate([
                // Stage 1: Filter reservations by restaurant id
                {
                    $match: { restaurant: restaurant._id }
                },
                // Stage 2: Group remaining documents by timeslot and calculate total quantity
                {
                    $group: { _id: "$time_slot", totalQuantity: { $sum: "$party_size" } }
                }
            ])

            const openHour = parseInt(restaurant.business_hours_open)
            const closeHour = parseInt(restaurant.business_hours_close)
            const operatingHours = []
            const fullHours = []

            for (let i = openHour; i < closeHour + 1; i++) {
                operatingHours.push(i)
            }

            reservations.forEach(hour => {
                if (hour.totalQuantity > restaurant.occupancy) fullHours.push(hour._id);
            })

            const unformattedAvailableHours = operatingHours.filter(item => !fullHours.includes(item));

            const formattedHours = format_business_hours(unformattedAvailableHours)

            return { restaurant, hours: formattedHours }
        },
        getAllRestaurants: async () => {
            const restaurants = await Restaurant.find({})
                .select('-__v')

            return restaurants
        },
        getRestaurantsByOwner: async (parent, { ownerID }) => {
            const restaurants = await Restaurant.find({ owner: { _id: ownerID } })
                .select('-__v')

            return restaurants
        },
        getReservationsByUser: async (parent, { userID }) => {
            const reservation = await Reservation.find({ user: { _id: userID } })
                .select('-__v')
                .populate('restaurant')
                .populate('user')

            return reservation
        },
        getReservationsByRestaurant: async (parent, { restaurantID }) => {
            return Reservation.find({ restaurant: { _id: restaurantID } })
                .select('-__v')
                .populate('user')
        },
        getReservationsByOwner: async (parent, { ownerID }) => {
            const reservation = await Reservation.find({})
                .select('-__v')
                .populate('restaurant')
                .populate('user')

            return reservation.filter(reservation => reservation.restaurant.owner._id == ownerID)
        },

    },
    Mutation: {
        createUser: async (parent, { input }) => {
            const user = await User.create(input);
            const token = signToken(user);

            return { token, user };
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
        createRestaurant: async (parent, { input }) => {
            const restaurant = await Restaurant.create(input);

            return restaurant;
        },
        createReservation: async (parent, { input }) => {
            const reservation = await Reservation.create(input);
            const newReservation = await Reservation.find({ _id: reservation._id }).populate('user').populate('restaurant');

            const businessName = newReservation[0].restaurant.business_name;
            const party = newReservation[0].party_size;
            const timeSlot = format_business_hours([newReservation[0].time_slot])[0];
            const firstName = newReservation[0].user.first_name;
            const phoneNumber = newReservation[0].user.phone_number;

            client.messages
                .create({
                    body:
                        `Hello ${firstName}, your table is confirmed at ${businessName} for ${party} people at ${timeSlot}.`,
                    from: '+17853776055',
                    to: `+1${phoneNumber}`
                })

            return reservation;
        },
        updateReservation: async (parent, { input }) => {
            const updatedReservation = await Reservation.findOneAndUpdate(
                { _id: input.reservationID },
                input,
                { new: true, runValidators: true }
            ).populate('user').populate('restaurant')

            const businessName = updatedReservation.restaurant.business_name;
            const party = updatedReservation.party_size;
            const timeSlot = format_business_hours([updatedReservation.time_slot])[0];
            const firstName = updatedReservation.user.first_name;
            const phoneNumber = updatedReservation.user.phone_number;

            client.messages
                .create({
                    body:
                        `Hello ${firstName}, your reservation has been updated at ${businessName} for ${party} people at ${timeSlot}.`,
                    from: '+17853776055',
                    to: `+1${phoneNumber}`
                })

            return updatedReservation
        },
        updateRestaurant: async (parent, { input }) => {
            const updatedRestaurant = await Restaurant.findOneAndUpdate(
                { _id: input._id },
                input,
                { new: true, runValidators: true }
            );

            return updatedRestaurant
        },
        updateUser: async (parent, { input }) => {
            const updatedUser = await User.findOneAndUpdate(
                { _id: input._id },
                input,
                { new: true, runValidators: true }
            );

            return updatedUser;
        },
        deleteUser: async (parent, { _id }) => {
            const user = await User.findOneAndDelete({ _id })

            return user;
        },
        deleteReservation: async (parent, { _id }) => {
            const reservation = await Reservation.findOneAndDelete({ _id })

            return reservation;
        },
        deleteAllReservations: async () => {
            const reservation = await Reservation.deleteMany({})

            return reservation;
        },
        deleteAllRestaurants: async () => {
            const restaurant = await Restaurant.deleteMany({})

            return restaurant;
        },
        deleteAllUsers: async () => {
            const user = await User.deleteMany({})

            return user;
        },
        deleteRestaurant: async (parent, { _id }) => {
            const restaurant = await Restaurant.findOneAndDelete({ _id })

            return restaurant;
        },
    }
};

module.exports = resolvers;
