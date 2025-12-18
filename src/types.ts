export type OwnedPokemon = {
    _id: string
    pokemonId: string
    nickname: string
    attack: number
    defense: number
    speed: number
    special: number
    level: number
};

export type PokemonUser = {
    _id: string
    name: string
    pokemons: OwnedPokemon[]
};

export type PokemonType =
    | "NORMAL"
    | "FIRE"
    | "WATER"
    | "ELECTRIC"
    | "GRASS"
    | "ICE"
    | "FIGHTING"
    | "POISON"
    | "GROUND"
    | "FLYING"
    | "PHYSIC"
    | "BUG"
    | "ROCK"
    | "GHOST"
    | "DRAGON";
