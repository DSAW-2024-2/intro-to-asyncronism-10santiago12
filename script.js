// Función para obtener un Pokémon aleatorio
function getRandomPokemon() {
    const randomId = Math.floor(Math.random() * 1025) + 1;
    clearPokemonInfo();
    getPokemonById(randomId);
}

document.getElementById('title').addEventListener('click', () => {
    window.location.reload();
});

// Función para obtener información de un Pokémon por ID
function getPokemonById(id) {
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

    // Verificar si existe la imagen en 'sprites.front_default' o 'official-artwork', de lo contrario no mostrar el Pokémon
    const imageUrl = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default;

    // Si no existe ninguna imagen, mostrar un mensaje de que el Pokémon no tiene imagen y no mostrar la tarjeta
    if (!imageUrl) {
        pokemonInfo.innerHTML += `
            <div class="pokemon-card" onclick="showPokemonDetails('${pokemon.id}')">
                <h2>${pokemon.name}</h2>
                <p>No se encontró una imagen disponible para este Pokémon.</p>
            </div>
        `;
        return;
    }

    // Mostrar el Pokémon con la imagen si está disponible
    pokemonInfo.innerHTML += `
        <div class="pokemon-card" onclick="showPokemonDetails('${pokemon.id}')">
            <h2>${pokemon.name}</h2>
            <p>Peso: ${pokemon.weight}</p>
            <img src="${imageUrl}" alt="${pokemon.name}">
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

// Función para mostrar el modal con detalles del Pokémon
function showPokemonDetails(id) {
    fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
        .then(response => response.json())
        .then(data => {
            const modalContent = document.getElementById('modalPokemonDetails');
            const imageUrl = data.sprites.other['official-artwork'].front_default || data.sprites.front_default;

            modalContent.innerHTML = `
                <h2>${data.name}</h2>
                <img src="${imageUrl}" alt="${data.name}">
                <p>Peso: ${data.weight}</p>
                <p>Altura: ${data.height}</p>
                <p>Tipo(s): ${data.types.map(typeInfo => typeInfo.type.name).join(', ')}</p>
            `;

            document.getElementById('pokemonModal').style.display = 'flex';
        })
        .catch(error => {
            console.error('Error al obtener detalles del Pokémon:', error);
        });
}

// Evento para cerrar el modal
document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('pokemonModal').style.display = 'none';
});

// Función para cargar Pokémon adicionales (después de los primeros 20)
function loadMorePokemons() {
    fetch(`https://pokeapi.co/api/v2/pokemon?limit=20&offset=${offset}`)
        .then(response => response.json())
        .then(data => {
            data.results.forEach(pokemon => {
                getPokemonByName(pokemon.name, false); // Mostrar Pokémon sin limpiar en cada llamada
            });
            offset += 20; // Incrementar el desplazamiento para la próxima carga
        })
        .catch(error => console.error('Error al cargar más Pokémon:', error));
}

// Evento en el botón de "Cargar Más"
document.getElementById('loadMore').addEventListener('click', () => {
    loadMorePokemons(); // Cargar más Pokémon cuando se haga clic en el botón
});

document.getElementById('searchByName').addEventListener('click', () => {
    const name = document.getElementById('pokemonName').value;
    if (name) {
        getPokemonByName(name);
    }
});

window.onload = () => {
    loadPokemons();
    getPokemonTypes();
};

let offset = 20; // Desplazamiento inicial después de los primeros 20 Pokémon
