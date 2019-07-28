// Copyright 2016, Google, Inc.
// Licensed under the Apache License, Version 2.0 (the 'License');
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//    http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an 'AS IS' BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
'use strict';

const {dialogflow} = require('actions-on-google');
const functions = require('firebase-functions');
const request = require('request');
const app = dialogflow({debug: true});

/* eslint-disable */
app.intent('open_pokedex', (conv, {pokemon}) => {
    const dexEntry = new PokeDex(pokemon.toLowerCase());
    return dexEntry.getDesc()
        .then((entry) => { (conv.close(entry)) })
        .catch(error => {
            (conv.close(error));
            console.error(error);
        });
});

exports.pokeDex = functions.https.onRequest(app);

function PokeDex(pokemon) {

    function getDesc() {
        return new Promise((resolve, reject) => {

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
                    // resolve(dexEntry.replace(/\u000c/g, ' '));
                    resolve(formatText(dexEntry));
                }
            });
        })
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
    };
}