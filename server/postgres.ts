require("dotenv").config();
import { Pool } from "pg";

export const pool = new Pool({
  connectionString: process.env.PG_DB,
  ssl: {
    rejectUnauthorized: false,
  },
});

async function connectSql() {
  try {
    await pool.connect();
    console.log("Connected to database");
  } catch (error) {
    console.log(error);
    console.log("Could not connect to database");
  }
}
// connectSql();

export async function get20Pokemons(from = 0, limit = 20) {
  const query = {
    text: "SELECT * FROM pokemons order by id limit $1 offset $2",
    values: [limit, from],
  };
  try {
    return await pool
      .query(query.text, query.values)
      .then((res: any) => res.rows);
  } catch (e) {
    console.error(e);
  }
}

export async function getPokemonSearch(pokemon: string | number) {
  let query;
  if (typeof pokemon === "string") {
    query = {
      text: "SELECT * FROM pokemons WHERE name = $1",
      values: [pokemon],
    };
    try {
      const result = await pool
        .query(query.text, query.values)
        .then((res: any) => res.rows[0]);
      console.log(result);
      return result;
    } catch (e) {
      console.error(e);
    }
  } else {
    query = {
      text: "SELECT * FROM pokemons WHERE id = $1",
      values: [pokemon],
    };
    try {
      return await pool
        .query(query.text, query.values)
        .then((res: any) => res.rows[0]);
    } catch (e) {
      console.error(e);
    }
  }
}

export async function getAllStars() {
  const query = {
    text: `SELECT * FROM pokemons WHERE "isFavorite" = true`,
    values: [],
  };
  try {
    return await pool
      .query(query.text, query.values)
      .then((res: any) => res.rows);
  } catch (e) {
    console.error(e);
  }
}

export async function RemoveStar(name: string) {
  const query = {
    text: 'UPDATE pokemons SET "isFavorite" = false WHERE name = $1',
    values: [name],
  };
  try {
    return await pool
      .query(query.text, query.values)
      .then((res: any) => res.rows);
  } catch (e) {
    console.error(e);
  }
}

export async function AddStar(pokemon: string) {
  const query = {
    text: 'UPDATE pokemons SET "isFavorite" = true WHERE name = $1',
    values: [pokemon],
  };
  try {
    return await pool
      .query(query.text, query.values)
      .then((res: any) => res.rows);
  } catch (e) {
    console.error(e);
  }
}

export async function isPokemonFavorite(pokemon: string) {
  const query = {
    text: 'SELECT "isFavorite" FROM pokemons WHERE name = $1',
    values: [pokemon],
  };
  try {
    const pokemonFromDB = await pool
      .query(query.text, query.values)
      .then((res: any) => res.rows);
    return pokemonFromDB[0].isFavorite == true;
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
  const query = {
    text: `SELECT * FROM pokemons ORDER BY pokemons.${sortBy} ${
      dir == 1 ? "ASC" : "DESC"
    } LIMIT $1 OFFSET $2`,
    values: [limit, from],
  };
  try {
    return await pool
      .query(query.text, query.values)
      .then((res: any) => res.rows);
  } catch (e) {
    console.error(e);
  }
}
