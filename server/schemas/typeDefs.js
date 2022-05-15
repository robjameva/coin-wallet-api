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

	type User {
		_id: ID
		first_name: String
		last_name: String
		phone_number: String
		email: String
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

	input UserInput {
		first_name: String!
		last_name: String!
		phone_number: String!
		password: String!
		email: String!
	}

	input UserUpdateInput {
		_id: ID!
		first_name: String
		last_name: String
		phone_number: String
		email: String
	}

	type Query {
		getUser(userId: ID!): User

	}
  
	type Mutation {
		login(email: String!, password: String!): Auth
		createUser(input: UserInput): Auth
		updateUser(input: UserUpdateInput): User
		deleteUser(_id: ID!): User
		deleteAllUsers: User

	}	

	type Auth {
		token: ID!
		user: User
	}
`;

// export the typeDefs
module.exports = typeDefs;


// type Query {
// 	getUser(userId: ID!): User
// 	getRestaurant(restaurantId: ID!): ResWithHours
// 	getAllRestaurants: [Restaurant]
// 	getRestaurantsByOwner(ownerID: ID!): [Restaurant]
// 	getReservationsByUser(userID: ID!): [Reservation]
// 	getReservationsByRestaurant(restaurantID: ID!): [Reservation]
// 	getReservationsByOwner(ownerID: ID!): [Reservation]
// }