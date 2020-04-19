const pokeDex = require('./PokeDex');
const dex = new pokeDex.PokeDex();
const request = require('request');

dex.getPokeType(645, null, null);
// request('https://pokeapi.co/api/v2/pokemon-species/dratini', function (error, response, body) {
//     if (!error && response.statusCode == 200) {
//         var info = JSON.parse(body);
//         console.log(info);
//     }
// })