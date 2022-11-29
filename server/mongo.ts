require("dotenv").config();
import { MongoClient, Db, Collection } from "mongodb";

export const client = new MongoClient(process.env.MONGO_DB);

export async function connectMongo(dbName: string, collectionName: string) {
  try {
    await client.connect();
    console.log("connected to DB");
    const db: Db = client.db(dbName);
    const collection: Collection = db.collection(collectionName);
    return collection;
  } catch (e) {
    console.error(e);
  }
}

export async function get20Pokemons(from = 0, limit = 20) {
  try {
    const pokemons = await connectMongo("pokedex", "pokemons");
    return await pokemons.find({}).skip(from).limit(limit).toArray();
  } catch (e) {
    console.error(e);
  }
}

export async function getPokemonSearch(pokemon: string | number) {
  if (typeof pokemon === "string") {
    try {
      const collectionName = await connectMongo("pokedex", "pokemons");
      return await collectionName.findOne({ name: pokemon });
    } catch (e) {
      console.error(e);
    }
  } else {
    try {
      const collectionName = await connectMongo("pokedex", "pokemons");
      return await collectionName.findOne({ id: pokemon });
    } catch (e) {
      console.error(e);
    }
  }
}

export async function getAllStars() {
  try {
    const collectionName = await connectMongo("pokedex", "pokemons");
    return await collectionName.find({ isFavorite: true }).toArray();
  } catch (e) {
    console.error(e);
  }
}

export async function RemoveStars(pokemon: string) {
  try {
    const collectionName = await connectMongo("pokedex", "pokemons");
    return await collectionName.updateOne(
      { name: pokemon },
      { $set: { isFavorite: false } }
    );
  } catch (e) {
    console.error(e);
  }
}

export async function AddStars(pokemon: string) {
  try {
    const collectionName = await connectMongo("pokedex", "pokemons");
    return await collectionName.updateOne(
      { name: pokemon },
      { $set: { isFavorite: true } }
    );
  } catch (e) {
    console.error(e);
  }
}

export async function SearchStars(pokemon: string) {
  try {
    const collectionName = await connectMongo("pokedex", "pokemons");
    const find = await collectionName.findOne({ name: pokemon });
    return find?.isFavorite == true;
  } catch (e) {
    console.error(e);
  }
}

export async function get20Sorted(
  from: number = 0,
  limit: number = 20,
  sortBy: "name" | "id",
  dir: 1 | -1
) {
  try {
    const pokemons = await connectMongo("pokedex", "pokemons");
    let response = await pokemons
      .find({})
      .sort(sortBy, dir)
      .skip(from)
      .limit(limit)
      .toArray();
    return response;
  } catch (e) {
    console.error(e);
  }
}
