const { GraphQLServer } = require("graphql-yoga");
const fetch = require("node-fetch");

const typeDefs = `
  type Query {
    hello(name: String): String!
    person(id: Int!): Person
    persons: [Person]
  }

  type Planet {
    name: String
    rotation_period: String
    orbital_period: String
    films: [Film]
  }

  type Film {
    title: String
    episode_id: Int
    opening_crawl: String
    director: String
    producer: String
    release_date: String
  }

  type Person {
    name: String
    height: String
    mass: String
    hair_color: String
    skin_color: String
    eye_color: String
    birth_year: String
    gender: String
    films: [Film]
    homeworld: Planet
    luckyNumber: Int
    adviceFromKanye: String
  }
`;

const resolveFilms = parent => {
  const promises = parent.films.map(async url => {
    const response = await fetch(url);
    return response.json();
  });

  return Promise.all(promises);
};

const resolvers = {
  Planet: {
    films: resolveFilms
  },
  Person: {
    homeworld: async parent => {
      const response = await fetch(parent.homeworld);
      return response.json();
    },
    films: resolveFilms,
    luckyNumber: () => { 
      return Math.floor(Math.random() * 100) + 1
    },
    adviceFromKanye: async () => {
      const response = await fetch("https://api.kanye.rest/");
      const data = await response.json();
      return data['quote'];
    }
  },
  Query: {
    hello: (_, { name }) => `Hello ${name || "World"}`,
    person: async (_, { id }) => {
      const response = await fetch(`https://swapi.dev/api/people/${id}/`);
      return response.json();
    },
    persons: async (_) => {
      const response = await fetch(`https://swapi.dev/api/people/`);
      const results = await response.json();
      return results['results']
    }
  }
};

const server = new GraphQLServer({ typeDefs, resolvers });
server.start(() => console.log("Server is running on localhost:4000"));