require("dotenv").config();
import { MongoClient } from "mongodb";
import * as fs from "fs";

const data = JSON.parse(
  fs.readFileSync(__dirname + "/pokemonData.json", "utf-8")
);
const amountOfOriginalPokemons = data.length;
let fusionIterator = amountOfOriginalPokemons + 1;
const client = new MongoClient(process.env.MONGO_DB);

function run() {
  let arr = [];
  addOriginalPokemonsToArray(arr);
  addAllFusionsToArray(arr);
  addArrayToDb(arr.slice(0, 50000)).then(() => console.log("done"));
}
run();

function addOriginalPokemonsToArray(arr) {
  arr.push(...data);
}

function addAllFusionsToArray(arr) {
  for (let i = 0; i < amountOfOriginalPokemons; i++) {
    for (let j = 0; j < amountOfOriginalPokemons; j++) {
      if (i !== j) {
        arr.push(combinePokemons(arr[i], arr[j], fusionIterator++));
      }
    }
  }
}

function combinePokemons(pok1, pok2, id) {
  return {
    name: pok1.name + "/" + pok2.name,
    rawData: null,
    id: id,
    height: Math.floor((pok1.height + pok2.height) / 2).toString(),
    weight: Math.floor((pok1.weight + pok2.weight) / 2).toString(),
    isFavorite: false,
    moves: [
      ...pok1.moves.slice(0, Math.floor(pok1.moves.length / 2)),
      ...pok2.moves.slice(Math.floor(pok2.moves.length / 2)),
    ],
    visualId: id.toString(),
    pictureSrc: [
      `https://raw.githubusercontent.com/Aegide/custom-fusion-sprites/main/CustomBattlers/${pok1.id}.${pok2.id}.png`,
      `https://raw.githubusercontent.com/Aegide/autogen-fusion-sprites/master/Battlers/${pok1.id}/${pok1.id}.${pok2.id}.png`,
    ],
    pokemonTypes: [pok1.pokemonTypes[0], pok2.pokemonTypes[0]],
    spritesSources: {},
  };
}

async function addArrayToDb(arr) {
  try {
    await client.connect();
    let pokedex = client.db("pokedex");
    const dbCollections = await pokedex.listCollections().toArray();
    let pokemons = pokedex.collection("pokemons");
    if (dbCollections.map((x) => x.name).includes("pokemons")) {
      await pokemons.drop();
    }
    await pokemons.insertMany(arr, {
      maxTimeMS: 99999,
    });
    await client.close();
  } catch (e) {
    console.log(e);
  }
}
