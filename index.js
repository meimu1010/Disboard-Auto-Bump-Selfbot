require('dotenv').config();
const { Client } = require('discord.js-selfbot-v13');
const client = new Client();

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}!`);

    // ステータスの設定
    client.user.setPresence({
        activities: [{
            name: 'Monitoring bumps, dissokus, dicoalls',
            type: 'WATCHING', // 他に'PLAYING', 'LISTENING', 'STREAMING'などがある
        }],
        status: 'idle', // 'online', 'idle', 'dnd'（Do Not Disturbの略）, 'invisible'のいずれか
    });

    const bumpChannels = process.env.BUMP_CHANNELS.split(',').map(id => id.trim());
    const dissokuChannels = process.env.DISSOKU_CHANNELS.split(',').map(id => id.trim());
    const dicoallChannels = process.env.DICOALL_CHANNELS.split(',').map(id => id.trim());
    const dcafeChannels = process.env.DCAFE_CHANNELS.split(',').map(id => id.trim()); // DCafeのチャンネルIDリスト

    function getCurrentTime() {
        const now = new Date();
        return now.toLocaleString(); // 現在の日時を読みやすい形式で返す
    }

    async function executeCommand(channels, commandId, commandName) {
        for (const [index, channelId] of channels.entries()) {
            try {
                const channel = await client.channels.fetch(channelId);
                await channel.sendSlash(commandId, commandName);
                const guild = channel.guild;
                console.log(`[${getCurrentTime()}] ${commandName} executed in server: ${guild.name}`);
                if (commandName === 'bump' && index === 1) {
                    // 2つ目のサーバーに対して30分後に再度実行
                    setTimeout(async () => {
                        try {
                            await channel.sendSlash(commandId, commandName);
                            console.log(`[${getCurrentTime()}] ${commandName} executed again in server: ${guild.name} after 30 minutes`);
                        } catch (error) {
                            console.error(`[${getCurrentTime()}] Error executing ${commandName} again in server: ${guild.name} after 30 minutes`, error);
                        }
                    }, 30 * 60 * 1000); // 30分後
                }
            } catch (error) {
                console.error(`[${getCurrentTime()}] Error executing ${commandName} in channel: ${channelId}`, error);
            }
        }
    }

    function startLoop(interval, func) {
        setTimeout(async function loop() {
            await func();
            setTimeout(loop, interval);
        }, interval);
    }

    const INTERVALS = {
        bump: (2 * 60 * 60 * 1000) + (3 * 1000), // 2時間+1分
        dissoku: (1 * 60 * 60 * 1000) + (3 * 1000), // 1時間+1分
        dicoall: (1 * 60 * 60 * 1000) + (3 * 1000), // 1時間+1分
        dcafe: (1 * 60 * 60 * 1000) + (3 * 1000), // 1時間+1分
    };

    const COMMANDS = [
        { channels: bumpChannels, id: '302050872383242240', name: 'bump', interval: INTERVALS.bump },
        { channels: dissokuChannels, id: '761562078095867916', name: 'dissoku up', interval: INTERVALS.dissoku },
        { channels: dicoallChannels, id: '903541413298450462', name: 'up', interval: INTERVALS.dicoall },
        { channels: dcafeChannels, id: '850493201064132659', name: 'up', interval: INTERVALS.dcafe }, // DCafe用
    ];

    for (const { channels, id, name, interval } of COMMANDS) {
        executeCommand(channels, id, name);
        startLoop(interval, () => executeCommand(channels, id, name));
    }
});

client.login(process.env.TOKEN);
