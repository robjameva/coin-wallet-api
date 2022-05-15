const { Schema, model, Types } = require('mongoose');

const reservationSchema = new Schema(
    {
        party_size: {
            type: Number,
            required: true
        },
        time_slot: {
            type: Number,
            required: true
        },
        user: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
        restaurant: {
            type: Schema.Types.ObjectId,
            ref: 'Restaurant'
        }
    }
)



const Reservation = model('Reservation', reservationSchema);

module.exports = { Reservation, reservationSchema };
