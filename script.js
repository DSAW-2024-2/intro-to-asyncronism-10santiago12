// Mapa de tipos de Pokémon a colores
const typeColors = {
    fire: '#FF9A9A',     
    water: '#A2C2E2',        
    electric: '#F6E3B4',     
    grass: '#B9D6B8',        
    ice: '#A1E8E4',          
    fighting: '#E4B7A0',     
    poison: '#C3A6D1',       
    ground: '#D1B6A3',       
    flying: '#B2D9F7',       
    psychic: '#F4A6B8',      
    bug: '#B2D8B2',          
    rock: '#B0B0B0',         
    ghost: '#C8A0D0',       
    dragon: '#A0A6D4',       
    dark: '#6D6D6D',        
    steel: '#B0B0B0',
    fairy: '#F4C6D8'         
};

function getRandomPokemon() {
    clearPokemonInfo();
    getPokemonById(Math.floor(Math.random() * 1025) + 1);
}

document.getElementById('title').addEventListener('click', () => window.location.reload());

document.getElementById('randomPokemon').addEventListener('click', getRandomPokemon);

function getPokemonById(id) {
    fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
        .then(response => response.json())
        .then(displayPokemon)
        .catch(() => alert('No se encontró el Pokémon aleatorio'));
}

function displayPokemon(pokemon) {
    const pokemonInfo = document.getElementById('pokemonInfo');
    const imageUrl = pokemon.sprites.other['official-artwork'].front_default || pokemon.sprites.front_default;
    const abilities = pokemon.abilities.map(({ ability }) => ability.name).join(', ');
    const types = pokemon.types.map(({ type }) => type.name);
    const primaryType = types[0];

    pokemonInfo.innerHTML += `
        <div class="pokemon-card" style="background-color: ${typeColors[primaryType] || 'gray'};" onclick="showPokemonDetails('${pokemon.id}')">
            <h2>${pokemon.name}</h2>
            <p>Weight: ${pokemon.weight / 10} Kg</p>
            <p>Type: ${types.join(', ')}</p>
            <img src="${imageUrl}" alt="${pokemon.name}">
            <p>Click to see more details</p>
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
            data.results.forEach(({ name }) => getPokemonByName(name, false));
        })
        .catch(() => console.error('Error al obtener los primeros 20 Pokémon'));
}

function getPokemonTypes() {
    fetch('https://pokeapi.co/api/v2/type')
        .then(response => response.json())
        .then(data => {
            const select = document.getElementById('pokemonType');
            select.innerHTML = '<option value="">Choose</option>';
            data.results.forEach(({ name }) => {
                const option = document.createElement('option');
                option.value = name;
                option.textContent = name;
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
        .catch(() => alert('No se pudieron cargar los tipos de Pokémon'));
}

function getEvolutionChain(url) {
    return fetch(url)
        .then(response => response.json())
        .then(data => {
            const evolutionChain = [];
            function traverse(chain) {
                evolutionChain.push({ name: chain.species.name, url: chain.species.url });
                chain.evolves_to.forEach(traverse);
            }
            traverse(data.chain);
            return evolutionChain;
        })
        .catch(() => []);
}

function getPokemonByType(type) {
    fetch(`https://pokeapi.co/api/v2/type/${type}`)
        .then(response => response.json())
        .then(data => {
            clearPokemonInfo();
            data.pokemon.forEach(({ pokemon: { name } }) => getPokemonByName(name, false));
        })
        .catch(() => console.error('Error al obtener Pokémon por tipo'));
}

function getPokemonByName(name, shouldClear = true) {
    fetch(`https://pokeapi.co/api/v2/pokemon/${name.toLowerCase()}`)
        .then(response => response.json())
        .then(data => {
            if (shouldClear) clearPokemonInfo();
            displayPokemon(data);
        })
        .catch(() => alert('No se encontró el Pokémon'));
}

function showPokemonDetails(id) {
    fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
        .then(response => response.json())
        .then(data => {
            const modalContent = document.getElementById('modalPokemonDetails');
            const imageUrl = data.sprites.other['official-artwork'].front_default || data.sprites.front_default;
            const abilities = data.abilities.map(({ ability, is_hidden }) => is_hidden ? `${ability.name}` : ability.name).join(', ');
            const types = data.types.map(({ type }) => type.name);
            const primaryType = types[0];
            const typeColor = typeColors[primaryType] || 'gray';

            return fetch(data.species.url)
                .then(response => response.json())
                .then(speciesData => getEvolutionChain(speciesData.evolution_chain.url)
                    .then(evolutionChain => {
                        const evolutionPromises = evolutionChain.map(({ name }) =>
                            fetch(`https://pokeapi.co/api/v2/pokemon/${name}`)
                                .then(response => response.json())
                                .then(({ sprites: { front_default } }) => ({ name, image: front_default }))
                                .catch(() => ({ name, image: '' }))
                        );

                        return Promise.all(evolutionPromises)
                            .then(evolutionDetails => {
                                const evolutionHTML = evolutionDetails.map(({ name, image }) =>
                                    image ? `<img src="${image}" alt="${name}" title="${name}" style="width: 50px; height: 50px;">` : `<span>${name}</span>`
                                ).join(' → ');

                                modalContent.innerHTML = `
                                    <span id="closeModal">&times;</span>
                                    <h2>${data.name}</h2>
                                    <img src="${imageUrl}" alt="${data.name}">
                                    <p>ID: ${data.id}</p>
                                    <p>Weight: ${data.weight / 10} Kg</p>
                                    <p>Height: ${data.height / 10} Mts</p>
                                    <p>Type: ${types.join(', ')}</p>
                                    <p>Skills: ${abilities}</p>
                                    <p>Evolutions: ${evolutionHTML}</p>
                                `;

                                modalContent.style.backgroundColor = typeColor;
                                document.getElementById('pokemonModal').style.display = 'flex';
                                document.body.style.overflow = 'hidden';

                                document.getElementById('closeModal').onclick = () => {
                                    document.getElementById('pokemonModal').style.display = 'none';
                                    document.body.style.overflow = 'auto';
                                };
                            });
                    })
                );
        })
        .catch(() => console.error('Error al obtener detalles del Pokémon'));
}

document.getElementById('closeModal').addEventListener('click', () => {
    document.getElementById('pokemonModal').style.display = 'none';
    document.body.style.overflow = 'auto';
});

function loadMorePokemons() {
    fetch(`https://pokeapi.co/api/v2/pokemon?limit=20&offset=${offset}`)
        .then(response => response.json())
        .then(data => {
            data.results.forEach(({ name }) => getPokemonByName(name, false));
            offset += 20;
        })
        .catch(() => console.error('Error al cargar más Pokémon'));
}

document.getElementById('loadMore').addEventListener('click', loadMorePokemons);

document.getElementById('back').addEventListener('click', () => {
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
});

document.getElementById('searchByName').addEventListener('click', () => {
    const name = document.getElementById('pokemonName').value;
    if (name) getPokemonByName(name);
});

window.onload = () => {
    loadPokemons();
    getPokemonTypes();
};

let offset = 20;