require('dotenv').config();
const { Client } = require('discord.js-selfbot-v13');
const client = new Client();

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    // ステータスの設定
    client.user.setPresence({
        activities: [{
            name: 'Monitoring bumps and dissokus',
            type: 'WATCHING', // 他に'PLAYING', 'LISTENING', 'STREAMING'などがある
        }],
        status: 'online', // 'online', 'idle', 'dnd'（Do Not Disturbの略）, 'invisible'のいずれか
    });

    const bumpChannel = await client.channels.fetch(process.env.BUMP_CHANNEL);
    const dissokuChannel = await client.channels.fetch(process.env.DISSOKU_CHANNEL);

    async function bump() {
        await bumpChannel.sendSlash('302050872383242240', 'bump');
        console.count('Bumped!');
    }

    async function dissoku() {
        await dissokuChannel.sendSlash('761562078095867916', 'dissoku up');
        console.count('Dissoku Upped!');
    }

    function bumpLoop() {
        // 2時間ごとに送信
        const interval = (2 * 60 * 60 * 1000) + (1 * 60 * 1000); // ミリ秒でのインターバル
        setTimeout(function () {
            bump();
            bumpLoop();
        }, interval);
    }

    function dissokuLoop() {
        // 1時間ごとに送信
        const interval = (1 * 60 * 60 * 1000) + (1 * 60 * 1000); // ミリ秒でのインターバル
        setTimeout(function () {
            dissoku();
            dissokuLoop();
        }, interval);
    }
    
    bump();
    bumpLoop();
    
    dissoku();
    dissokuLoop();
});

client.login(process.env.TOKEN);
