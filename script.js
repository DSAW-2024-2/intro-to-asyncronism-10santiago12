function getRandomPokemon() {
    const randomId = Math.floor(Math.random() * 1025) + 1;
    clearPokemonInfo();
    getPokemonById(randomId);
}

document.getElementById('title').addEventListener('click', () => {
    window.location.reload();
});

function getPokemonById(id) {
    fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
        .then(response => response.json())
        .then(data => displayPokemon(data))
        .catch(error => {
            console.error('Error al obtener Pokémon aleatorio:', error);
            alert('No se encontró el Pokémon aleatorio');
        });
}

document.getElementById('randomPokemon').addEventListener('click', () => {
    getRandomPokemon();
});

function displayPokemon(pokemon) {
    const pokemonInfo = document.getElementById('pokemonInfo');
    const imageUrl = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default;

    if (!imageUrl) {
        pokemonInfo.innerHTML += `
            <div class="pokemon-card" onclick="showPokemonDetails('${pokemon.id}')">
                <h2>${pokemon.name}</h2>
                <p>No se encontró una imagen disponible para este Pokémon.</p>
            </div>
        `;
        return;
    }

    const abilities = pokemon.abilities.map(abilityInfo => abilityInfo.ability.name).join(', ');

    pokemonInfo.innerHTML += `
        <div class="pokemon-card" onclick="showPokemonDetails('${pokemon.id}')">
            <h2>${pokemon.name}</h2>
            <p>Weight: ${pokemon.weight/10} Kg</p>
            <p>Type: ${pokemon.types.map(typeInfo => typeInfo.type.name).join(', ')}</p>
            <img src="${imageUrl}" alt="${pokemon.name}">
        </div>
    `;
}

function clearPokemonInfo() {
    document.getElementById('pokemonInfo').innerHTML = '';
}

function loadPokemons() {
    fetch('https://pokeapi.co/api/v2/pokemon?limit=20')
        .then(response => response.json())
        .then(data => {
            clearPokemonInfo();
            data.results.forEach(pokemon => getPokemonByName(pokemon.name, false));
        })
        .catch(error => console.error('Error al obtener los primeros 20 Pokémon:', error));
}

function getPokemonTypes() {
    fetch('https://pokeapi.co/api/v2/type')
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById('pokemonType');
            select.innerHTML = '<option value="">Choose</option>';
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

function getEvolutionChain(url) {
    return fetch(url)
        .then(response => response.json())
        .then(data => {
            const evolutionChain = [];
            function traverse(chain) {
                evolutionChain.push({
                    name: chain.species.name,
                    url: chain.species.url
                });
                if (chain.evolves_to.length > 0) {
                    chain.evolves_to.forEach(evolution => traverse(evolution));
                }
            }
            traverse(data.chain);
            return evolutionChain;
        })
        .catch(error => {
            console.error('Error al obtener la cadena de evolución:', error);
            return [];
        });
}

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
        .catch(error => console.error('Error al obtener Pokémon por tipo:', error));
}

function getPokemonByName(name, shouldClear = true) {
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

function showPokemonDetails(id) {
    fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
        .then(response => response.json())
        .then(data => {
            const modalContent = document.getElementById('modalPokemonDetails');
            const imageUrl = data.sprites.other['official-artwork'].front_default || data.sprites.front_default;
            const abilities = data.abilities.map(abilityInfo => abilityInfo.is_hidden ? `${abilityInfo.ability.name}` : abilityInfo.ability.name).join(', ');

            return fetch(data.species.url)
                .then(response => response.json())
                .then(speciesData => getEvolutionChain(speciesData.evolution_chain.url)
                    .then(evolutionChain => {
                        const evolutionPromises = evolutionChain.map(evo => fetch(`https://pokeapi.co/api/v2/pokemon/${evo.name}`)
                            .then(response => response.json())
                            .then(pokemonData => ({ name: evo.name, image: pokemonData.sprites.front_default }))
                            .catch(error => {
                                console.error(`Error al obtener datos de ${evo.name}:`, error);
                                return { name: evo.name, image: '' };
                            })
                        );

                        return Promise.all(evolutionPromises)
                            .then(evolutionDetails => {
                                const evolutionHTML = evolutionDetails.map(evo => evo.image ? `<img src="${evo.image}" alt="${evo.name}" title="${evo.name}" style="width: 50px; height: 50px;">` : `<span>${evo.name}</span>`).join(' → ');
                                modalContent.innerHTML = `
                                    <h2>${data.name}</h2>
                                    <img src="${imageUrl}" alt="${data.name}">
                                    <p>Weight: ${data.weight/10} Kg</p>
                                    <p>Height: ${data.height/10} Mts</p>
                                    <p>Type: ${data.types.map(typeInfo => typeInfo.type.name).join(', ')}</p>
                                    <p>Skills: ${abilities}</p>
                                    <p>Evolutions: ${evolutionHTML}</p>
                                `;
                                document.getElementById('pokemonModal').style.display = 'flex';
                                document.body.style.overflow = 'hidden';
                            });
                    })
                );
        })
        .catch(error => console.error('Error al obtener detalles del Pokémon:', error));
}

document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('pokemonModal').style.display = 'none';
    document.body.style.overflow = 'auto';
});

function loadMorePokemons() {
    fetch(`https://pokeapi.co/api/v2/pokemon?limit=20&offset=${offset}`)
        .then(response => response.json())
        .then(data => {
            data.results.forEach(pokemon => getPokemonByName(pokemon.name, false));
            offset += 20;
        })
        .catch(error => console.error('Error al cargar más Pokémon:', error));
}

document.getElementById('loadMore').addEventListener('click', () => {
    loadMorePokemons();
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

let offset = 20;
