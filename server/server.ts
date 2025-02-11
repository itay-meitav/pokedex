import express, { Request, Response } from "express";
import path from "path";
import cors from "cors";
import {
  getPokemonSearch,
  getAllStars,
  RemoveStar,
  AddStar,
  isPokemonFavorite,
  get20Pokemons,
  get20Sorted,
} from "./postgres";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
  cors({
    credentials: true,
    origin: true,
  })
);
app.use(express.static(path.join(__dirname, "../client")));

app.get("/pokemons", async (req: Request, res: Response) => {
  try {
    let offset = Number(req.query.offset) || 0;
    let limit = 20;
    let sort = req.query.sort;
    if (sort) {
      if (sort === "A2Z") {
        res.status(200).json(await get20Sorted(offset, limit, "name", 1));
      } else if (sort === "Z2A") {
        res.status(200).json(await get20Sorted(offset, limit, "name", -1));
      } else if (sort === "h2l") {
        res.status(200).json(await get20Sorted(offset, limit, "id", -1));
      } else if (sort === "l2h") {
        res.status(200).json(await get20Sorted(offset, limit, "id", 1));
      }
    } else {
      let response = await get20Pokemons(offset, limit);
      res.status(200).json(response);
      console.log(response);
    }
  } catch {
    res.status(400).send({ message: "Error" });
  }
});

app.get("/:searchValue", async (req: Request, res: Response) => {
  if (!isNaN(Number(req.params.searchValue))) {
    try {
      const pokemonID = Number(req.params.searchValue);
      const dataPokemon = await getPokemonSearch(pokemonID);
      if (!dataPokemon) {
        res.status(400).send({ message: "Pokemon not found" });
      } else {
        res.status(200).json(dataPokemon);
      }
    } catch {
      res.status(400).send({ message: "Error" });
    }
  } else {
    try {
      const pokemonName = req.params.searchValue.toLowerCase();
      const dataPokemon = await getPokemonSearch(pokemonName);
      if (!dataPokemon) {
        res.status(400).send({ message: "Pokemon not found" });
      } else {
        res.status(200).json(dataPokemon);
      }
    } catch {
      res.status(400).send({ message: "Error" });
    }
  }
});

app.post("/star", async (req: Request, res: Response) => {
  try {
    const pokemonSearch = await isPokemonFavorite(req.body.name.toLowerCase());
    if (pokemonSearch == true) {
      await RemoveStar(req.body.name.toLowerCase());
      return res.status(202).send({ message: "Removed from favorites" });
    } else {
      await AddStar(req.body.name.toLowerCase());
      res.status(200).send({ message: "Added to favorites" });
    }
  } catch {
    res.status(500).send({ message: "Error" });
  }
});

app.get("/star/star", async (req: Request, res: Response) => {
  try {
    res.status(200).json(await getAllStars());
  } catch {
    res.status(400).send({ message: "Error" });
  }
});

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
