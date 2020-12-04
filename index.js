const Discord = require('discord.js');
const bot = new Discord.Client();
let activeDMs = [];

bot.login(process.env.TOKEN);

bot.on('ready', function () {
    console.log('This bot is online!');
});

bot.on('message', async function (msg) {
    if (msg.channel.type != 'dm') return;
    if (activeDMs.includes(msg.channel.id)) return;
    if (msg.author.bot) return;

    activeDMs.push(msg.channel.id);
    await msg.channel.send('Please enter the key for this message.');

    await msg.channel.awaitMessages(() => true, { max: 1, time: 30000, error: ['time'] })
        .then(function (m) {
            m = m.first();
            const c = new VigenèreCipher(m.content, 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ!@#$%^&*()-_+=`~[]{}|;:"\'.,<>?/ ');
            console.log(`${m.author.tag} encoded '${msg.content}'`)
            const embed = new Discord.MessageEmbed()
                .setDescription(`Encoded form: \`${c.encode(msg.content)}\`\nDecoded form: \`${c.decode(msg.content)}\``);

            m.channel.send(embed);
            activeDMs.splice(activeDMs.indexOf(m.channel.id), 1);
        })
        .catch(function (e) {
            console.log(e);
            msg.channel.send('Error');
            activeDMs.splice(activeDMs.indexOf(msg.channel.id), 1);
        })
})

function VigenèreCipher(key, abc) {
    this.encode = function (str) {
        return str.split('').map(function (v, i) {
            if (abc.indexOf(v) == -1) { return v; }
            return abc[(abc.indexOf(v) + abc.indexOf(key[i % key.length])) % abc.length];
        }).join('');
    };
    this.decode = function (str) {
        return str.split('').map(function (v, i) {
            if (abc.indexOf(v) == -1) { return v; }
            var ind = abc.indexOf(v) - abc.indexOf(key[i % key.length]);
            return abc[ind < 0 ? ind + abc.length : ind];
        }).join('');
    };
}