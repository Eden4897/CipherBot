const Discord = require('discord.js');
const bot = new Discord.Client();
let activeDMs = [];

bot.login(process.env.TOKEN);

bot.on('ready', function(){
    console.log('This bot is online!');
});

bot.on("message", async function(msg){
    if(msg.channel.type != 'dm') return;
    if(activeDMs.includes(msg.channel.id)) return;
    if(msg.author.bot) return;

    activeDMs.push(msg.channel.id);
    await msg.channel.send('Please enter the key for this message.');

    await msg.channel.awaitMessages(function(m){
        if(isNaN(m.content) || parseFloat(m.content) != parseInt(m.content)){
            m.channel.send("Please enter a valid key.");
            return false;
        }
        return true;
    }, {max: 1, time: 30000, error: ["time"]})
    .then(function(m){
        m = m.first();
        const key = parseInt(m.content);
        const embed = new Discord.MessageEmbed()
        .setDescription(`Encoded form: \`${encodeRailFenceCipher(msg.content, key)}\`\nDecoded form: \`${decodeRailFenceCipher(msg.content, key)}\``);

        m.channel.send(embed);
        activeDMs.splice(activeDMs.indexOf(m.channel.id), 1);
    })
    .catch(function(){
        msg.channel.send("Error");
        activeDMs.splice(activeDMs.indexOf(msg.channel.id), 1);
    })
})

function encodeRailFenceCipher(string, numberRails) {
    let matrix = [];
    for(let i = 0; i < string.length; i++){
        matrix.push([]);
        for(let j = 0; j < numberRails; j++){
            matrix[i].push('-1');
        }
    }
    let currentRail = 0;
    let direction = true;
    for(let i = 0; i < string.length; i++){
        matrix[i][currentRail] = string[i];
        if(direction){
            currentRail++;
            if(currentRail == numberRails - 1) direction = false;
        }
        else{
            currentRail--;
            if(currentRail == 0) direction = true;
        }
    }

    let out = '';
    
    for(let rail = 0; rail < numberRails; rail++){
        for(let i = 0; i < matrix.length; i++){
            if(matrix[i][rail] != -1) 
                out += matrix[i][rail];
        }
    }
    return out;
}

function decodeRailFenceCipher(string, numberRails) {
    const interval = 2 * (numberRails - 1);
    let matrix = [];
    for(let i = 0; i < numberRails; i++){
        matrix.push([]);
        for(let j = 0; j < string.length; j++){
            matrix[i].push('-1');
        }
    }

    let strIndex = 0;

    for(let rail = 0; rail < numberRails; rail ++){
        for(let i = rail; i < string.length; i += interval){
            matrix[rail][i] = string[strIndex];
            if(rail != 0 && rail != numberRails - 1){
                if(i + interval - 2 * rail < string.length){ 
                    strIndex++;
                    matrix[rail][i + interval - 2 * rail] = string[strIndex];
                }
            }
            strIndex++;
        }
    }

    let out = '';

    for(let i = 0; i < string.length; i++){
        for(let rail = 0; rail < numberRails; rail++){
            if(matrix[rail][i] != '-1'){
                out += matrix[rail][i];
            }
        }
    }

    return out;
}