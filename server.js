import { ApolloServer } from '@apollo/server'
import { startStandaloneServer } from '@apollo/server/standalone'

import { Sequelize, DataTypes } from 'sequelize';

const sequelize = new Sequelize({dialect: 'sqlite', storage: "./db-sqlite"});
const Dish = sequelize.define('Dish', {
  title: DataTypes.STRING,
  description: DataTypes.STRING,
  allergens: DataTypes.STRING,
  image: DataTypes.STRING,
});

const Basket = sequelize.define('Basket', {
  address: DataTypes.STRING,
  city: DataTypes.STRING,
  cp: DataTypes.STRING,
});

Basket.hasMany(Dish);
Dish.belongsTo(Basket);

await sequelize.sync();

const typeDefs = `#graphql
  type Dish {
    id: ID!
    title: String
    description: String
    allergens: String
    image: String
  }

  type Basket {
    id: ID!
    Dishes: [Dish]
    address: String
    city: String
    cp: String
  }

  type Query {
    dishes: [Dish]
    dish(id: ID!): Dish
    baskets: [Basket]
    basket(id: ID!): Basket
  }

  type Mutation {
    addDish(title: String, description: String, allergens: String, image: String): Dish
    updateDish(id: ID!, title: String, artist: String, album: String, year: Int, genre: String): Dish
    deleteDish(id: ID!): Dish
    createBasket(address: String, city: String, cp: String): Basket
    addDishToBasket(idBasket: ID!, idDish: ID!): Basket
    removeDishFromBasket(idBasket: ID!, idDish: ID!): Basket
  }
`;

const resolvers = {
  Query: {
    dishes: async () => {
      return await Dish.findAll();
    },
    dish: async (parent, args) => {
      const { id } = args;
      return await Dish.findByPk(id);
    },
    baskets: async () => {
      return await Basket.findAll({ include: [Dish] });
    },
    basket: async (parent, args) => {
      const { id } = args;
      return await Basket.findByPk(id, { include: [Dish] });
    },
  },
  Mutation: {
    addDish: async (parent, args) => {
      const { title, description, allergens, image } = args;
      return await Dish.create({ title, description, allergens, image });
    },
    updateDish: async (parent, args) => {
      const { id, title, artist, album, year, genre } = args;
      await Dish.update({ title, artist, album, year, genre }, { where: { id: id } });
      return await Dish.findByPk(id);
    },
    deleteDish: async (parent, args) => {
      const { id } = args;
      const dish = await Dish.findByPk(id);
      await Dish.destroy({ where: { id: id } });
      return dish;
    },
    createBasket: async (parent, args) => {
      const { address, city, cp } = args;
      return await Basket.create({ address, city, cp });
    },
    addDishToBasket: async (parent, args) => {
      const { idBasket, idDish } = args;
      
      const basket = await Basket.findByPk(idBasket);
      if (!basket) {
        throw new Error('Basket not found');
      }
      
      const dish = await Dish.findByPk(idDish);
      if (!dish) {
        throw new Error('Dish not found');
      }
      
      await basket.addDish(dish);
      
      return await Basket.findByPk(idBasket, { include: [Dish] });
    },
    removeDishFromBasket: async (parent, args) => {
      const { idBasket, idDish } = args;
      
      const basket = await Basket.findByPk(idBasket);
      if (!basket) {
        throw new Error('Basket not found');
      }
      
      const dish = await Dish.findByPk(idDish);
      if (!dish) {
        throw new Error('Dish not found');
      }
      
      await basket.removeDish(dish);
      
      return await Basket.findByPk(idBasket, { include: [Dish] });
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

// Démarrage du serveur
const { url } = await startStandaloneServer(server, {
  listen: { port: 4000 },
})
console.log(`🚀  Server running at ${url}`);
