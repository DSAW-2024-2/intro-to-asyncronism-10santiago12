// Función para obtener un Pokémon aleatorio
function getRandomPokemon() 
{
    const randomId = Math.floor(Math.random() * 1025) + 1;
    clearPokemonInfo();
    getPokemonById(randomId);
}

// Función para obtener información de un Pokémon por ID
function getPokemonById(id) 
{
    fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('No se encontró el Pokémon con este ID');
            }
            return response.json();
        })
        .then(data => {
            displayPokemon(data);
        })
        .catch(error => {
            console.error('Error al obtener Pokémon aleatorio:', error);
            alert('No se encontró el Pokémon aleatorio');
        });
}

// Evento en el botón de Pokémon aleatorio
document.getElementById('randomPokemon').addEventListener('click', () => {
    getRandomPokemon();
});

// Función para mostrar la información del Pokémon
function displayPokemon(pokemon) {
    const pokemonInfo = document.getElementById('pokemonInfo');
    pokemonInfo.innerHTML += `
        <div class="pokemon-card">
            <h2>${pokemon.name}</h2>
            <p>Peso: ${pokemon.weight}</p>
            <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        </div>
    `;
}

// Función para limpiar el contenedor de Pokémon
function clearPokemonInfo() {
    const pokemonInfo = document.getElementById('pokemonInfo');
    pokemonInfo.innerHTML = '';
}

// Función para obtener los primeros 20 Pokémon al cargar la página
function loadPokemons() {
    fetch('https://pokeapi.co/api/v2/pokemon?limit=20')
        .then(response => response.json())
        .then(data => {
            clearPokemonInfo();
            data.results.forEach(pokemon => {
                getPokemonByName(pokemon.name, false);
            });
        })
        .catch(error => console.error('Error al obtener los primeros 20 Pokémon:', error));
}

// Función para obtener la lista de tipos de Pokémon y crear un select
function getPokemonTypes() {
    fetch('https://pokeapi.co/api/v2/type')
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById('pokemonType');
            select.innerHTML = '<option value="">Selecciona un tipo</option>';
            data.results.forEach(type => {
                const option = document.createElement('option');
                option.value = type.name;
                option.textContent = type.name;
                select.appendChild(option);
            });
            select.addEventListener('change', () => {
                const selectedType = select.value;
                if (selectedType) {
                    clearPokemonInfo();
                    getPokemonByType(selectedType);
                }
            });
        })
        .catch(error => {
            console.error('Error al obtener los tipos de Pokémon:', error);
            alert('No se pudieron cargar los tipos de Pokémon');
        });
}

// Función para obtener Pokémon por tipo y mostrar todos los de ese tipo
function getPokemonByType(type) {
    fetch(`https://pokeapi.co/api/v2/type/${type}`)
        .then(response => response.json())
        .then(data => {
            clearPokemonInfo();
            data.pokemon.forEach(pokemonEntry => {
                const pokemonName = pokemonEntry.pokemon.name;
                getPokemonByName(pokemonName, false);
            });
        })
        .catch(error => {
            console.error('Error al obtener Pokémon por tipo:', error);
        });
}

// Función para obtener información de un Pokémon por nombre
function getPokemonByName(name, shouldClear = true) {
    console.log(`Buscando Pokémon por nombre: ${name}`);
    fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`)
        .then(response => response.json())
        .then(data => {
            if (shouldClear) clearPokemonInfo();
            displayPokemon(data);
        })
        .catch(error => {
            console.error('Error al buscar Pokémon por nombre:', error);
            alert('No se encontró el Pokémon');
        });
}

window.onload = () => {
    loadPokemons();
    getPokemonTypes();
};

document.getElementById('searchByName').addEventListener('click', () => {
    const name = document.getElementById('pokemonName').value;
    if (name) {
        getPokemonByName(name);
    }
});
