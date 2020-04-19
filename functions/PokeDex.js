const request = require('request');



exports.PokeDex = function() {

    function getDesc(pokemon) {
        return new Promise((resolve, reject) => {
            getPokemon(pokemon, resolve, reject);
        })
    }

    function getT(pokemon) {
        return new Promise((resolve, reject) => {
            getPokeType(pokemon, resolve, reject);
        })
    }


    function getPokeType(pokemon, resolve, reject){
        //Get pokemon-species json object
        const url = 'https://pokeapi.co/api/v2/pokemon/' + pokemon + '/';
        request.get(url, (error, response, body) => {
            if (error) {
                reject("PokeDex.getDesc(): " + error +" "+url);
                return console.log(error);
            }
            let pokeSpecies = JSON.parse(body);

            let types = getType(pokeSpecies);

            if (isStringEmpty(types)) {
                reject("PokeDex.getDesc(): No description for " + pokemon)
            } else {
                resolve(formatTypeText(types, pokemon));
            }
        });
    }


    function getType(pokemon){
        types = [];

        for (let i=0; i < pokemon['types'].length; i++){
            types[i] = pokemon['types'][i]['type']['name'];
        }

        return types;
    }

    function formatTypeText(types, name){
        if(types.length > 1){
            return name+" is a "+types[0]+" and "+types[1]+" type Pokemon";
        }else{
            return name+" is a "+types[0]+" type Pokemon";
        }
    }

    function getPokemon(pokemon, resolve, reject){
        //Get pokemon-species json object
        const url = 'https://pokeapi.co/api/v2/pokemon-species/' + pokemon + '/';
        request.get(url, (error, response, body) => {
            if (error) {
                reject("PokeDex.getDesc(): " + error +" "+url);
                return console.log(error);
            }
            let pokeSpecies = JSON.parse(body);

            let dexEntry = createPokedexEntry(pokeSpecies);

            if (isStringEmpty(dexEntry)) {
                reject("PokeDex.getDesc(): No description for " + pokemon)
            } else {
                resolve(formatText(dexEntry));
            }
        });
    }




    function createPokedexEntry(pokeSpecies){
        let name = getName(pokeSpecies);
        let preEvolution = getPreEvolution(pokeSpecies);
        let flavorText = getTextEntry(pokeSpecies, 'en')
        let genus = getGenera(pokeSpecies, 'en');

        if (isStringEmpty(preEvolution)) {
            return  name+'. '+'The '+genus+'. '+flavorText;
        } else {
            return  name+'. '+'The '+genus+'. The evolved form of '+preEvolution+'. '+flavorText;
        }
    }

    function getName(pokeSpecies){
        return pokeSpecies['name'];
    }

    function getPreEvolution(pokeSpecies){
        if (!isStringEmpty(pokeSpecies['evolves_from_species'])) {
            return pokeSpecies['evolves_from_species']['name'];
        }
    }

    function getTextEntry(pokeSpecies, language){
        let languageIndex = 0;
        for (let i = pokeSpecies['flavor_text_entries'].length - 1; i > 0; i--) {
            if (isLanguageMatch(pokeSpecies['flavor_text_entries'][i]['language']['name'], language)) {
                languageIndex = i;
                break;
            }
        }

        return pokeSpecies['flavor_text_entries'][languageIndex]['flavor_text'];
    }

    function getGenera(pokeSpecies, language){
        let languageIndex = 0;
        for (let i = pokeSpecies['genera'].length - 1; i > 0; i--) {
            if (isLanguageMatch(pokeSpecies['genera'][i]['language']['name'], language)) {
                languageIndex = i;
                break;
            }
        }

        return pokeSpecies['genera'][languageIndex]['genus'];
    }

    function isStringEmpty(text){
        if (typeof text === 'undefined' || text === null) {
            return true;
        }else{
            return false;
        }
    }

    function isLanguageMatch(text, language){
        if(text === language){
            return true;
        }else{
            return false;
        }
    }

    function formatText(text){
        return text.replace(/\u000c/g, ' ');
    }

    return {
        getDesc: getDesc,
        getPokemon: getPokemon,
        getPokeType: getPokeType,
        getT: getT,
    };
};

