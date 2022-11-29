require("dotenv").config();
import { pool } from "./postgres";
import fs from "fs";

let data = JSON.parse(
  fs.readFileSync(__dirname + "/pokemonData.json", "utf-8")
);
const amountOfOriginalPokemons = data.length;
let fusionIterator = amountOfOriginalPokemons + 1;

function run() {
  let arr = [];
  arr.push(...data);
  addOriginalPokemonsToArray(arr);
  addAllFusionsToArray(arr);
  addArrayToDb(arr.slice(0, 50000)).then(() => console.log("done"));
}
run();

function addOriginalPokemonsToArray(arr) {
  arr.push(...data);
}

function addAllFusionsToArray(arr: any[]) {
  for (let i = 0; i < amountOfOriginalPokemons; i++) {
    for (let j = 0; j < amountOfOriginalPokemons; j++) {
      if (i !== j) {
        arr.push(combinePokemons(arr[i], arr[j], fusionIterator++));
      }
    }
  }
}

function combinePokemons(pok1, pok2, id: number) {
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

async function addArrayToDb(arr: any[]) {
  await pool.query("DROP TABLE IF EXISTS pokemons");
  await pool.query(`
		CREATE TABLE pokemons (
			id SERIAL PRIMARY KEY,
			"pictureSrc" text[] DEFAULT NULL,
			"name" varchar(225) DEFAULT NULL,
			"pokemonTypes" text[] DEFAULT NULL,
			"height" text DEFAULT NULL,
      "weight" text DEFAULT NULL,
      "moves" text[] DEFAULT NULL,
      "spritesSources" json DEFAULT NULL,
      "visualId" text DEFAULT NULL,
      "isFavorite" boolean DEFAULT false
		)
	`);

  while (arr.length) {
    let curr = arr.splice(0, 200);
    console.log("left:", arr.length);
    await insertAllIntoPokemonsDB(curr);
  }
  pool.end();
}

async function insertAllIntoPokemonsDB(arr: any[]) {
  let queryStr = `INSERT INTO pokemons ("pictureSrc","name","pokemonTypes","height","weight","moves","spritesSources","visualId",
  "isFavorite") VALUES `;

  arr = arr.map((x) => [
    x.pictureSrc,
    x.name,
    x.pokemonTypes,
    x.height,
    x.weight,
    x.moves,
    JSON.stringify(x.spritesSources),
    x.visualId,
    x.isFavorite,
  ]);
  let index = 1;
  let values = `(${arr
    .map(
      (x) =>
        `$${index++}, $${index++},$${index++},$${index++},$${index++},$${index++},$${index++},$${index++},$${index++} `
    )
    .join("),(")})`;
  queryStr += values + "returning id";
  if (arr.length) await pool.query(queryStr, arr.flat(1));
}
