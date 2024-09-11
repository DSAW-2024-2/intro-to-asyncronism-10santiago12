// Función para obtener un Pokémon aleatorio
function getRandomPokemon() 
{
    const randomId = Math.floor(Math.random() * 1025) + 1; // Generar ID aleatorio entre 1 y 1025
    clearPokemonInfo(); // Limpiar el contenedor antes de mostrar el Pokémon aleatorio
    getPokemonById(randomId); // Llamar a la función que busca el Pokémon por ID
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
            displayPokemon(data); // Muestra la información del Pokémon aleatorio
        })
        .catch(error => {
            console.error('Error al obtener Pokémon aleatorio:', error);
            alert('No se encontró el Pokémon aleatorio');
        });
}

// Evento en el botón de Pokémon aleatorio
document.getElementById('randomPokemon').addEventListener('click', () => {
    getRandomPokemon(); // Llamar a la función que genera el Pokémon aleatorio
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
    pokemonInfo.innerHTML = ''; // Limpia el contenedor
}

// Función para obtener los primeros 20 Pokémon al cargar la página
function loadPokemons() {
    fetch('https://pokeapi.co/api/v2/pokemon?limit=20')
        .then(response => response.json())
        .then(data => {
            clearPokemonInfo(); // Limpiar antes de mostrar los primeros 20
            data.results.forEach(pokemon => {
                getPokemonByName(pokemon.name, false); // Mostrar Pokémon sin limpiar en cada llamada
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
            // Limpiar el select antes de agregar opciones
            select.innerHTML = '<option value="">Selecciona un tipo</option>';
            data.results.forEach(type => {
                const option = document.createElement('option');
                option.value = type.name;
                option.textContent = type.name;
                select.appendChild(option);
            });

            // Escuchar cambios en el select para buscar automáticamente al seleccionar un tipo
            select.addEventListener('change', () => {
                const selectedType = select.value;
                if (selectedType) {
                    clearPokemonInfo(); // Limpiar los Pokémon mostrados por defecto antes de buscar
                    getPokemonByType(selectedType); // Buscar todos los Pokémon del tipo seleccionado
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
            clearPokemonInfo(); // Limpiar una sola vez antes de agregar los Pokémon de tipo
            data.pokemon.forEach(pokemonEntry => {
                const pokemonName = pokemonEntry.pokemon.name;
                getPokemonByName(pokemonName, false); // Mostrar cada Pokémon del tipo sin limpiar en cada iteración
            });
        })
        .catch(error => {
            console.error('Error al obtener Pokémon por tipo:', error);
        });
}

// Función para obtener información de un Pokémon por nombre
function getPokemonByName(name, shouldClear = true) {
    console.log(`Buscando Pokémon por nombre: ${name}`); // Depuración
    fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`)
        .then(response => response.json())
        .then(data => {
            if (shouldClear) clearPokemonInfo(); // Solo limpia si es una búsqueda única (por nombre o aleatorio)
            displayPokemon(data); // Muestra la información del Pokémon
        })
        .catch(error => {
            console.error('Error al buscar Pokémon por nombre:', error);
            alert('No se encontró el Pokémon');
        });
}

// Al cargar la página, muestra los primeros 20 Pokémon y obtiene el número total de Pokémon
window.onload = () => {
    loadPokemons(); // Muestra los primeros 20 Pokémon
    getPokemonTypes(); // Carga los tipos de Pokémon en el select
};

// Evento en el botón de búsqueda por nombre
document.getElementById('searchByName').addEventListener('click', () => {
    const name = document.getElementById('pokemonName').value;
    if (name) {
        getPokemonByName(name); // Busca el Pokémon por nombre
    }
});
