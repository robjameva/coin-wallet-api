// import the gql tagged template function
const { gql } = require('apollo-server-express');

// create our typeDefs
const typeDefs = gql`
	type Reservation {
		_id: ID!
		party_size: Int
		time_slot: Int
		user: User
		restaurant: Restaurant
	}

	input ReservationCreateInput {
		party_size: Int!
		time_slot: Int!
		user: ID!
		restaurant: ID!
	}

	input ReservationUpdateInput {
		reservationID: ID!
		party_size: Int
		time_slot: Int
		user: ID
		restaurant: ID
	}

	input UserInput {
		first_name: String!
		last_name: String!
		phone_number: String!
		password: String!
		email: String!
		isOwner: Boolean
	}

	input RestaurantInput {
		occupancy: Int!
		business_name: String!
		business_address: String!
		business_phone: String!
		business_hours_open: Int!
		business_hours_close: Int!
		business_website: String!
		business_image: String!
		owner: ID!
	}

	input RestaurantUpdateInput {
		_id: ID!
		occupancy: Int
		business_name: String
		business_address: String
		business_phone: String
		business_hours_open: Int
		business_hours_close: Int
		business_website: String
		business_image: String
		owner: ID
	}

	input UserUpdateInput {
		_id: ID!
		first_name: String
		last_name: String
		phone_number: String
		email: String
	}

	type User {
		_id: ID
		first_name: String
		last_name: String
		phone_number: String
		email: String
		isOwner: Boolean
	}

	type Restaurant {
		_id: ID
		occupancy: Int
		business_name: String
		business_address: String
		business_phone: String
		business_hours_open: Int!
		business_hours_close: Int!
		business_website: String
		business_image: String
		owner: User
	}


	type Query {
		getUser(userId: ID!): User
		getRestaurant(restaurantId: ID!): ResWithHours
		getAllRestaurants: [Restaurant]
		getRestaurantsByOwner(ownerID: ID!): [Restaurant]
		getReservationsByUser(userID: ID!): [Reservation]
		getReservationsByRestaurant(restaurantID: ID!): [Reservation]
		getReservationsByOwner(ownerID: ID!): [Reservation]
	}
  
	type Mutation {
		login(email: String!, password: String!): Auth
		createUser(input: UserInput): Auth
		createRestaurant(input: RestaurantInput): Restaurant
		createReservation(input: ReservationCreateInput): Reservation
		updateReservation(input: ReservationUpdateInput): Reservation
		updateRestaurant(input: RestaurantUpdateInput): Restaurant
		updateUser(input: UserUpdateInput): User
		deleteUser(_id: ID!): User
		deleteReservation(_id: ID!): Reservation
		deleteAllReservations: Reservation
		deleteAllRestaurants: Restaurant
		deleteAllUsers: User
		deleteRestaurant(_id: ID!): Restaurant
	}	

	type Auth {
		token: ID!
		user: User
	}

	type ResWithHours {
		restaurant: Restaurant
		hours: [String]
	}
`;

// export the typeDefs
module.exports = typeDefs;
