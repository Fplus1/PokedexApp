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

                //Get name
                let name = pokeSpecies['name'];

                //Get pre-evolution
                let preEvolution;
                if (typeof pokeSpecies['evolves_from_species'] !== 'undefined' && pokeSpecies['evolves_from_species'] !== null) {
                    preEvolution = pokeSpecies['evolves_from_species']['name'];
                }

                //Get flavor_text_entry in English
                let enTextEntry = 0;
                for (let i = pokeSpecies['flavor_text_entries'].length - 1; i > 0; i--) {
                    if (pokeSpecies['flavor_text_entries'][i]['language']['name'] === 'en') {
                        enTextEntry = i;
                        break;
                    }
                }
                let flavorText = pokeSpecies['flavor_text_entries'][enTextEntry]['flavor_text'];

                //Get genera in English
                let enGenera = 0;
                for (let i = pokeSpecies['genera'].length - 1; i > 0; i--) {
                    if (pokeSpecies['genera'][i]['language']['name'] === 'en') {
                        enGenera = i;
                        break;
                    }
                }
                let genus = pokeSpecies['genera'][enGenera]['genus'];

                //Return Pokedex entry
                let dexEntry = 'null';
                if (typeof preEvolution !== 'undefined' && preEvolution !== null) {
                    dexEntry = name+'. '+'The '+genus+'. The evolved form of '+preEvolution+'. '+flavorText;
                } else {
                    dexEntry = name+'. '+'The '+genus+'. '+flavorText;
                }

                if (typeof dexEntry !== 'undefined' && dexEntry !== null) {
                    resolve(dexEntry.replace(/\u000c/g, ' '));
                } else {
                    reject("PokeDex.getDesc(): No description for " + pokemon)
                }
            });
        })
    }

    return {
        getDesc: getDesc,
    };
}