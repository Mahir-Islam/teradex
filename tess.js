const Discord = require("discord.js");
const fetch = require('node-fetch');
const config = require('./token.json')

const {
    Client,
    Intents
} = require('discord.js');
const client = new Client({
    intents: [Intents.FLAGS.GUILDS, Intents.FLAGS.GUILD_MESSAGES]
});

var prefix = "-";

client.on("ready", function() {
    console.log("Teradex is online.");
});

var URL = "https://pogoapi.net/api/v1/"

var data = {
    alola: "alolan_pokemon.json",
    buddyDist: "pokemon_buddy_distances.json",
    candyEvltn: "pokemon_candy_to_evolve.json",
    catchRate: "pokemon_encounter_data.json",
    ditto: "possible_ditto_pokemon.json",
    evltn: "pokemon_evolutions.json",
    gnrtn: "pokemon_generations.json",
    maxCP: "pokemon_max_cp.json",
    names: "pokemon_names.json",
    nest: "nesting_pokemon.json",
    raidExclsvty: "raid_exclusive_pokemon.json",
    rare: "pokemon_rarity.json",
    stats: "pokemon_stats.json",
    type: "pokemon_types.json",
    typeMtchp: "type_effectiveness.json",
}

client.on("messageCreate", function(message) {



    async function GetPokeData(p) {

        PokeID = 0
        Name = ""
        Alolan = false
        BuddyDist = 0
        CatchRate = []
        CandyEvo = 0
        EvolvedForm = null
        Generation = 0
        MaxCP = 0
        Rarity = ""
        Stats = []
        Type = []

        Valid = true;

        p = p.charAt(0).toUpperCase()+p.slice(1).toLowerCase()

        await fetch(URL + data.names) //Get name and ID
            .then(res => res.json())
            .then(json => {
                JSON_LEN = Object.keys(json).length

                if (isNaN(p)) {
                    for (i = 1; i <= JSON_LEN; i++) {
                        if (json[i].name == p) PokeID = i;
                    }
                    if (PokeID == 0) {
                        console.log("This is an invalid Pokemon");
                        Valid = false;
                    }
                } else {
                    if (p < 1 || p > JSON_LEN) {
                        console.log("This is an invalid number");
                        Valid = false;
                    }
                    for (i = 1; i <= JSON_LEN; i++) {
                        if (json[i].id == p) PokeID = i;
                    }
                }

                if (Valid)
                Name = json[PokeID].name;

            })

        if (Valid) {

        await fetch(URL + data.alola) //Check whether it has an Alolaln Form
            .then(res => res.json())
            .then(json => {

                for (const [key, value] of Object.entries(json)) {
                    if (parseInt(key) == PokeID) Alolan = true;
                }
            })

        await fetch(URL + data.buddyDist) //Check buddy distance
            .then(res => res.json())
            .then(json => {

                W = false;

                for (let [key, VALUES] of Object.entries(json)) {
                    for (let value of VALUES) {
                        if (W) break;
                        if (value["pokemon_id"] == PokeID) {
                            BuddyDist = value["distance"];
                            W = true;
                        }
                    }
                }
            })

        await fetch(URL + data.catchRate) //Check Catch rate for Pokemon
            .then(res => res.json())
            .then(json => {
                W = false;

                for (i = 1; i <= JSON_LEN; i++) {
                    if (W) break;

                    let value = json[i]

                    if (value.pokemon_id == PokeID) {
                        W = true;
                        CatchRate = [value.attack_probability, value.base_capture_rate, value.base_flee_rate, value.dodge_probability]
                    }
                }
            })

        await fetch(URL + data.evltn) //Check Candy needed and Evolved forms
            .then(res => res.json())
            .then(json => {

                W = false;

                for (i = 1; i <= JSON_LEN; i++) {
                    if (W) break;

                    let value = json[i]

                    if (value.pokemon_id == PokeID) {
                        W = true;
                        CandyEvo = json[i].evolutions[0].candy_required
                        EvolvedForm = json[i].evolutions[0].pokemon_name
                    } else if (value.pokemon_id > PokeID) {
                        W = true;
                        break;
                    }
                }
            })

        await fetch(URL + data.gnrtn) //Check Pokemon's Generation
            .then(res => res.json())
            .then(json => {
                W = false;

                for (let [key, VALUES] of Object.entries(json)) {
                    for (let value of VALUES) {
                        if (W) break;
                        if (value["id"] == PokeID) {
                            Generation = key
                            W = true;
                        }
                    }
                }

            })

        await fetch(URL + data.maxCP) //Check Pokemon's Maximum CP
            .then(res => res.json())
            .then(json => {
                W = false;

                for (let value of json) {
                    if (value.pokemon_id == PokeID) {
                        MaxCP = value.max_cp
                    }
                }


            })

        await fetch(URL + data.rare) //Check Pokemon rarity
            .then(res => res.json())
            .then(json => {
                W = false;

                for (let [key, VALUES] of Object.entries(json)) {
                    for (let value of VALUES) {
                        if (W) break;
                        if (value["pokemon_id"] == PokeID) {
                            Rarity = value["rarity"]
                            W = true;
                        }
                    }
                }
            })

        await fetch(URL + data.stats) //Check Pokemon Base Stats
            .then(res => res.json())
            .then(json => {

                W = false;

                for (i = 1; i <= JSON_LEN; i++) {
                    if (W) break;

                    let value = json[i]

                    if (value.pokemon_id == PokeID) {
                        W = true;
                        Stats = [value.base_attack, value.base_defense, value.base_stamina]
                    }
                }
            })

        await fetch(URL + data.type) //Check Pokemon type
            .then(res => res.json())
            .then(json => {

                Type = []

                W = false;

                for (i = 1; i <= JSON_LEN; i++) {
                    if (W) break;

                    var value = json[i]

                    if (value.pokemon_id == PokeID) {
                        W = true;
                    }
                }

                Type = value.type
            })

        EvolutionCandyMSG = ""
        EvolvingMSG = `${Name} does not evolve`
        if (CandyEvo != 0) { //Pokemon has an evolution
            EvolutionCandyMSG = `Candies Needed to Evolve: ${CandyEvo}`
            EvolvingMSG = `${Name} evolves into ${EvolvedForm}\n`
        }

        AlolaNot = ""
        if (!Alolan) { //Pokemon has an Alolan Form
            AlolaNot = "does not have"
        } else {AlolaNot = "has"}


        var PokedexEntryEmbed = new Discord.MessageEmbed()
                    .setAuthor(`${Name}`,`https://pokemongo.fandom.com/wiki/${Name}`)
                    .setColor(Math.floor(Math.random() * 16581374).toString(16))
                    .setDescription(`Pokedex entry #${PokeID}: ${Name}`)
                    
                    .addField(`Candy Information`,
                        `Buddy Candy Disance: ${BuddyDist}km`
                        )

                    .addField('Catch Rate Information',
                    `Attack Probability: ${Math.round(CatchRate[0]*100)}%
                    Base Capture Rate: ${Math.round(CatchRate[1]*100)}%
                    Base Flee Rate: ${Math.round(CatchRate[2]*100)}%
                    Dodge Probability: ${Math.round(CatchRate[3]*100)}%`)

                    .addField('Evolution Information',
                        `${EvolvingMSG}${EvolutionCandyMSG}`)

                    .addField('PVP Information',
                        `Maximum Combat Power: ${MaxCP}
                        Type: ${Type.join('/')}`)

                    .addField(`Attack:`,`${Stats[0]}`,true)
                    .addField(`Defense:`,`${Stats[1]}`,true)
                    .addField(`Hit Points:`,`${Stats[2]}`,true)

                    .addField('Other Information',
                        `Rarity: ${Rarity}
                        Iteration: ${Generation}
                        This Pokemon ${AlolaNot} an Alolan Form`)


                    .setFooter("Data fetched from pogoapi.net")
        message.channel.send({embeds: [PokedexEntryEmbed]});
        } else {
            message.channel.send("The Pokedex number or name that you have entered is invalid");
        }

    }

    if (message.author.equals(client.user)) return;

    //console.log(message.author.toString() + ": " + message.content.toString());
    if (!message.content.startsWith(prefix)) return;


    var args = message.content.substring(prefix.length).split(" ");
    empty = "";

    switch (args[0].toLowerCase()) {
        case "dex":
            if (args[1] !== undefined){GetPokeData(args[1])}
            else{message.channel.send("Arguments: ```-dex <Pokemon Name or Number>```");}
            break;

        default:
            message.channel.send("Your command is invalid.\n```-dex <Pokemon Name or Number>```");
            break;
    }


});

client.login(config.token);