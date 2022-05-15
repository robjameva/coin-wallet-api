const { Schema, model } = require('mongoose');

const restaurantSchema = new Schema(
    {
        occupancy: {
            type: Number,
            required: true
        },
        business_name: {
            type: String,
            required: true,
            unique: true
        },
        business_address: {
            type: String,
            required: true,
            unique: true,
        },
        business_phone: {
            type: String,
            required: true,
            unique: true,
        },
        business_hours_open: {
            type: String,
            required: true,
        },
        business_hours_close: {
            type: String,
            required: true,
        },
        business_website: {
            type: String,
            required: true,
        },
        business_image: {
            type: String,
            required: true,
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: 'User'
        },
    }
);


const Restaurant = model('Restaurant', restaurantSchema);

module.exports = Restaurant;
