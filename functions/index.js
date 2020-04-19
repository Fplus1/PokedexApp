'use strict';

const {dialogflow} = require('actions-on-google');
const functions = require('firebase-functions');
const request = require('request');
const pokeDex = require('./PokeDex');

const app = dialogflow({debug: true});
const dex = new pokeDex.PokeDex();


// console.log(dex.getPokemon('dratini', null, null));

/* eslint-disable */
app.intent('open_pokedex', (conv, {pokemon}) => {
    return dex.getDesc(pokemon.toLowerCase())
        .then((entry) => { (conv.close(entry)) })
        .catch(error => {
            (conv.close(error));
            console.error(error);
        });
});

app.intent('get_type', (conv, {pokemon}) => {
    return dex.getT(pokemon.toLowerCase())
        .then((entry) => { (conv.close(entry)) })
        .catch(error => {
            (conv.close(error));
            console.error(error);
        });
});

exports.pokeDex = functions.https.onRequest(app);