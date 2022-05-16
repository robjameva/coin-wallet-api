// import the gql tagged template function
const { gql } = require('apollo-server-express');

// create our typeDefs
const typeDefs = gql`

	type Asset {
		_id: ID!
		coin_id: String
		coin_rank: String
		coin_symbol: String
		coin_name: String
		coin_supply: String
		coin_maxSupply: String
		coin_marketCapUsd: String
		coin_volumeUsd24Hr: String
		coin_priceUsd: String
		coin_changePercent24Hr: String
		coin_vwap24Hr: String
	}

	type User {
		_id: ID
		first_name: String
		last_name: String
		phone_number: String
		email: String
	}

	type Wallet {
		_id: ID
		owner: User
		coins: [Asset]
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
		getAllUsers: [User]
		getAssets: [Asset]
		getCoinData: [Asset]
		getIndividualCoinData(coinID: String!): Asset
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