import { Logic } from './Logic';
import { Pokemon } from './Pokemon';
const logic = new Logic();

export class HandleUi {
  finishLoadingUI() {
    const loader = document.querySelector('.loader') as HTMLDivElement;
    const buttons = document.querySelector('.buttons') as HTMLDivElement;
    const pokePreview = document.querySelector('.poke-preview') as HTMLDivElement;
    loader.style.display = 'none';
    buttons.style.display = 'flex';
    pokePreview.style.display = 'flex';
    const sortOptions = Array.from(document.querySelectorAll<HTMLLIElement>('.sort-option'));
    sortOptions.forEach((sortOption) => {
      sortOption.addEventListener('click', () => {
        this.removePokemonsFromDisplay();
        this.createAndDisplayPokemons(
          logic.sortPokemons(sortOption.id, logic.getPokemonArrFromLocalStorage())
        );
      });
    });
  }
  removePokemonsFromDisplay() {
    const pokeContainer = document.querySelector('.poke-container-body') as HTMLElement;
    pokeContainer.replaceChildren('');
  }
  createAndDisplayPokemons(pokemonArr: Pokemon[]) {
    for (let i = 0; i < pokemonArr.length; i++) {
      this.createPokemonCard(pokemonArr[i]);
    }
  }
  createPokemonCard = (pokemon: Pokemon) => {
    const colors = {
      fire: '#FDDFDF',
      grass: '#DEFDE0',
      electric: '#FCF7DE',
      water: '#DEF3FD',
      ground: '#f4e7da',
      rock: '#d5d5d4',
      fairy: '#fceaff',
      poison: '#98d7a5',
      bug: '#f8d5a3',
      dragon: '#97b3e6',
      psychic: '#eaeda1',
      flying: '#F5F5F5',
      fighting: '#E6E0D4',
      normal: '#F5F5F5',
    };
    const main_types = Object.keys(colors);
    const pokeContainer = document.querySelector('.poke-container-body') as HTMLElement;
    const pokemonCard = document.createElement('div');
    const id = pokemon.id.toString();
    pokemonCard.id = id;
    pokemonCard.classList.add('pokemon');
    const name = pokemon.name[0].toUpperCase() + pokemon.name.slice(1).replace('-', ' ');
    const visualId = pokemon.id.toString().padStart(3, '0');
    const poke_types = pokemon.pokemonTypes;

    const type = main_types.find((type) => poke_types.indexOf(type) > -1);
    const color = colors[type];
    pokemonCard.style.backgroundColor = color;

    pokemonCard.innerHTML = `
        <img class="star" id=${id} src="https://cdn-icons-png.flaticon.com/512/188/188931.png" alt="Add To Favorites" width="32" height="32">
        <div class="img-parent">
        <div class="img-container">
        <img src="https://assets.pokemon.com/assets/cms2/img/pokedex/detail/${visualId}.png" alt="">
        </div>
        </div>
        <div class="info">
        <span class="number">#${visualId}</span>
        <h3 class="name">${name}</h3>
        <small class="type">Type: <span>${type}</span></small>
        </div>`;

    const star = pokemonCard.querySelector('.star') as HTMLElement;
    star.addEventListener('click', (e) => {
      e.stopPropagation();
      star.classList.toggle('star-selected');
    });
    pokeContainer.appendChild(pokemonCard);
    pokemonCard.addEventListener('click', () => {
      addPokemonToPreviewBox(pokemon);
      const pokePreview = document.querySelector('.poke-preview') as HTMLElement;
      pokePreview.scrollIntoView({ behavior: 'smooth', block: 'center' });
    });
  };
}
export function addPokemonToPreviewBox(pokemon: Pokemon) {
  const nameEl = document.getElementById('name') as HTMLElement;
  nameEl.innerText = pokemon.name[0].toUpperCase() + pokemon.name.slice(1).replace('-', ' ');
  const type = document.querySelector('#type') as HTMLElement;
  type.textContent = `${
    pokemon.pokemonTypes[0][0].toUpperCase() + pokemon.pokemonTypes[0].slice(1)
  } type pokemon`;
  const moves = document.querySelector('#moves-list') as HTMLElement;
  for (let i = 0; i < 6; i++) {
    const li = moves.querySelectorAll('li')[i];
    li.innerText = pokemon.moves[i];
  }
  const height = document.querySelector('#height') as HTMLElement;
  height.innerText = `Height: ${pokemon.height}`;
  const weight = document.querySelector('#weight') as HTMLElement;
  weight.innerText = `Weight: ${pokemon.weight}`;
  const pic = document.querySelector('#pokeimg') as HTMLImageElement;
  if (pokemon.spritesSources.frontDefault != null) {
    pic.src = pokemon.spritesSources.frontDefault;
    addSpinAndShinyListeners(pokemon);
  } else {
    pic.src = pokemon.pictureSrc;
  }
}

function addSpinAndShinyListeners(pokemon: Pokemon) {
  const pic = document.querySelector('#pokeimg') as HTMLImageElement;
  const spinButton = document.getElementsByClassName('spin')[0];
  const shinyButton = document.getElementsByClassName('shiny')[0];
  const pokeImgRegularFront = pokemon.spritesSources.frontDefault;
  const pokeImgRegularBack = pokemon.spritesSources.backDefault;
  const pokeImgShinyFront = pokemon.spritesSources.frontShiny;
  const pokeImgShinyBack = pokemon.spritesSources.backShiny;
  spinButton.addEventListener('click', () => {
    if (pic.src === pokeImgRegularFront) {
      if (pokeImgRegularBack == null) {
        console.log('No back image');
        return;
      }
      pic.src = pokeImgRegularBack;
      return;
    }
    if (pic.src === pokeImgRegularBack) {
      pic.src = pokeImgRegularFront;
      return;
    }
    if (pic.src === pokeImgShinyFront) {
      if (pokeImgShinyBack == null) {
        console.log('No Shiny back image');
        return;
      }
      pic.src = pokeImgShinyBack;
      return;
    }
    if (pic.src === pokeImgShinyBack) {
      if (pokeImgShinyFront == null) {
        console.log('No Shiny front image');
        return;
      }
      pic.src = pokeImgShinyFront;
      return;
    }
  });
  shinyButton.addEventListener('click', () => {
    if (pic.src === pokeImgRegularFront) {
      if (pokeImgShinyFront == null) {
        console.log('No Shiny front image');
        return;
      }
      pic.src = pokeImgShinyFront;
      return;
    }
    if (pic.src === pokeImgRegularBack) {
      if (pokeImgShinyBack == null) {
        console.log('No Shiny back image');
        return;
      }
      pic.src = pokeImgShinyBack;
      return;
    }
    if (pic.src === pokeImgShinyFront) {
      pic.src = pokeImgRegularFront;
      return;
    }
    if (pic.src === pokeImgShinyBack) {
      if (pokeImgRegularBack == null) {
        console.log('No back image');
        return;
      }
      pic.src = pokeImgRegularBack;
      return;
    }
  });
}

export function handleInputEntered() {
  const inputEl = document.querySelector('.search-input') as HTMLInputElement;
  if (isNaN(Number(inputEl.value))) {
    const searchResult = logic.getPokemonByName(inputEl.value);
    if (searchResult !== null) addPokemonToPreviewBox(searchResult);
  } else {
    const searchResult = logic.getPokemonById(Number(inputEl.value));
    if (searchResult !== null) addPokemonToPreviewBox(searchResult);
  }
}
