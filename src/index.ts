// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { config } from 'dotenv';
import * as path from 'path';
import * as restify from 'restify';

// Import required bot services.
// See https://aka.ms/bot-services to learn more about the different parts of a bot.
import { BotFrameworkAdapter, ConversationState, MemoryStorage, TranscriptLoggerMiddleware } from 'botbuilder';

// Import required bot configuration.
import { BotConfiguration, IEndpointService, IQnAService } from 'botframework-config';
import { QnAMaker } from 'botbuilder-ai';

// This bot's main dialog.
import { MyBot } from './bot';
import { ChatLogger } from './dialogs/shared/chatlogger';

// bot endpoint name as defined in .bot file
// See https://aka.ms/about-bot-file to learn more about .bot file its use and bot configuration.
const NODE_ENV = process.env.NODE_ENV || 'development';

console.log(`running in ${NODE_ENV} mode`);

// Read botFilePath and botFileSecret from .env file.
// Note: Ensure you have a .env file and include botFilePath and botFileSecret.
if (NODE_ENV !== 'production') {
    const ENV_FILE = path.resolve('.env');
    config({ path: ENV_FILE });
}

// bot name as defined in .bot file
// See https://aka.ms/about-bot-file to learn more about .bot file its use and bot configuration.
const BOT_CONFIGURATION = NODE_ENV;
const QNA_CONFIGURATION = 'headacheKB';

// Create HTTP server.
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, () => {
    console.log(`\n${server.name} listening to ${server.url}`);
    console.log(`\nGet Bot Framework Emulator: https://aka.ms/botframework-emulator`);
    console.log(`\nTo talk to your bot, open hollybot.bot file in the Emulator.`);
});

server.get('*', restify.plugins.serveStatic({
    directory: path.resolve('./client'),
    default: 'index.html'
}));

// .bot file path
const BOT_FILE = path.resolve(process.env.botFilePath || '');

// Read bot configuration from .bot file.
let botConfig;
try {
    botConfig = BotConfiguration.loadSync(BOT_FILE, process.env.botFileSecret);
} catch (err) {
    console.error(`\nError reading bot file. Please ensure you have valid botFilePath and botFileSecret set for your environment.`);
    console.error(`\n - The botFileSecret is available under appsettings for your Azure Bot Service bot.`);
    console.error(`\n - If you are running this bot locally, consider adding a .env file with botFilePath and botFileSecret.`);
    console.error(`\n - See https://aka.ms/about-bot-file to learn more about .bot file its use and bot configuration.\n\n`);
    console.error(`error: `,err);
    process.exit();
}

// Get bot endpoint configuration by service name
const endpointConfig = botConfig.findServiceByNameOrId(BOT_CONFIGURATION) as IEndpointService;
const qnaConfig = botConfig.findServiceByNameOrId(QNA_CONFIGURATION) as IQnAService;

const qnaEndpointSettings = {
    knowledgeBaseId: qnaConfig.kbId,
    endpointKey: qnaConfig.endpointKey,
    host: qnaConfig.hostname
};

// Create adapter.
// See https://aka.ms/about-bot-adapter to learn more about .bot file its use and bot configuration.
const adapter = new BotFrameworkAdapter({
    appId: endpointConfig.appId || process.env.microsoftAppID,
    appPassword: endpointConfig.appPassword || process.env.microsoftAppPassword,
});

const logger = new ChatLogger(botConfig);
adapter.use(new TranscriptLoggerMiddleware(logger));

// Catch-all for errors.
adapter.onTurnError = async (context, error) => {
    // This check writes out errors to console log .vs. app insights.
    console.error(`\n [onTurnError]: ${ error }`);
    // Send a message to the user
    await context.sendActivity(`Oops. Something went wrong!`);
};

const memoryStorage = new MemoryStorage();
const conversationState = new ConversationState(memoryStorage);

// Create the main dialog.
// const myBot = new MyBot(conversationState, logger, botConfig, BOT_CONFIGURATION);
const myBot = new MyBot(conversationState, botConfig, BOT_CONFIGURATION);


server.get('/env.js', (req, res) => {
    res.setHeader('Content-Type','application/javascript');
    res.end(`window.directline_secret = '${process.env.DIRECTLINE_SECRET}';`);
});

// Listen for incoming requests.
server.post('/api/messages', (req, res) => {
    adapter.processActivity(req, res, async (context) => {
        // Route to main dialog.
        try {
            await myBot.onTurn(context);
        }
        catch (e) {
            console.log('on turn error', e);
        }
    });
});
