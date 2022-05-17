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
		quantity: Int
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
		getUserWallet(userId: ID!): Wallet
		getAllWallets: [Wallet]
		aggregateByCoin(userId: ID!, coinName: String!): Aggregate
		aggregateByWallet(userId: ID!): [Aggregate]
	}
  
	type Mutation {
		login(email: String!, password: String!): Auth
		createUser(input: UserInput): NewUser
		updateUser(input: UserUpdateInput): User
		deleteUser(_id: ID!): User
		deleteAllUsers: User
		saveCoin(walletID: ID!, coinID: String!, quantity: Int!): Wallet
		deleteCoin(walletID: ID!, coinDocumentID: String!, quantityToSubtract: Int!): Wallet

	}	

	type Auth {
		token: ID!
		user: User
	}

	type Aggregate {
		coin: String
		quantity: Int
		dollarCostAveragePrice: String
		valueUSD: String
	}

	type Group {
		coin: String
		quantity: Int
		price: String
	}

	type NewUser {
		token: ID!
		user: User
		wallet: Wallet
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