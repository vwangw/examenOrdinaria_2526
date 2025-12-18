import { ObjectId } from "mongodb";
import { getDB } from "../db/mongo";
import { COLLECTION_POKEMONS, COLLECTION_USERS } from "../utils";
import { PokemonType, OwnedPokemon } from "../types";

const getRandomInt = (min:number, max:number) => {
  const minimo = Math.ceil(min);
  const maximo = Math.floor(max);
  return Math.floor(Math.random() * (maximo - minimo) + minimo);
}

export const getPokemons = async (page?: number, size?: number) => {
  const db = getDB();
  page = page || 1;
  size = size || 10;

  return await db
    .collection(COLLECTION_POKEMONS)
    .find()
    .skip((page - 1) * size)
    .limit(size)
    .toArray();
};


export const getPokemonById = async (id: string) => {
  const db = getDB();
  return await db
    .collection(COLLECTION_POKEMONS)
    .findOne({ _id: new ObjectId(id) });
};


export const createPokemon = async (
  name: string,
  description: string,
  height: number,
  weight: number,
  types: PokemonType[]
) => {
  const db = getDB();
  const result = await db.collection(COLLECTION_POKEMONS).insertOne({
    name,
    description,
    height,
    weight,
    types,
  });

  const newPokemon = await getPokemonById(result.insertedId.toString());
  return newPokemon;
};


export const catchPokemon = async (
  pokemonId: string,
  userId: string,
  nickname?: string
): Promise<OwnedPokemon | undefined> => {
  const db = getDB();
  const localUserId = new ObjectId(userId);
  const localPokemonId = new ObjectId(pokemonId);

  const pokemonToAdd = await db
    .collection(COLLECTION_POKEMONS)
    .findOne({ _id: localPokemonId });
  if (!pokemonToAdd) throw new Error("Pokemon not found");

  
  const ownedPokemon: OwnedPokemon = {
    _id: new ObjectId().toString(), 
    pokemonId: localPokemonId.toString(),
    nickname: nickname || pokemonToAdd.name,
    attack: getRandomInt(1, 101),
    defense: getRandomInt(1, 101),
    speed: getRandomInt(1, 101),
    special: getRandomInt(1, 101),
    level: getRandomInt(1, 101),
  };

  await db.collection(COLLECTION_USERS).updateOne(
    { _id: localUserId },
    { $addToSet: { pokemons: ownedPokemon } }
  );

  const updatedUser = await db.collection(COLLECTION_USERS).findOne({ _id: localUserId });

  return updatedUser?.pokemons.find(
    (p: any) => p._id === ownedPokemon._id
  );
};


export const freePokemon = async (ownedPokemonId: string, userId: string): Promise<{ _id: string; name: string; pokemons: OwnedPokemon[] }> => {
  const db = getDB();
  const localUserId = new ObjectId(userId);
  
  const user = await db.collection(COLLECTION_USERS).findOne({ _id: localUserId });
  if (!user) throw new Error("User not found");

  const pokemonIndex = user.pokemons.findIndex((p: any) => p._id === ownedPokemonId);
  if (pokemonIndex === -1) throw new Error("Owned Pokemon not found");

  user.pokemons.splice(pokemonIndex, 1);

  await db.collection(COLLECTION_USERS).updateOne(
    { _id: localUserId },
    { $set: { pokemons: user.pokemons } }
  );

  return {
    _id: user._id.toString(),
    name: user.name || "Trainer",
    pokemons: user.pokemons
  };
};