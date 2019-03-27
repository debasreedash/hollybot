/**
 * Logs chat messages to the CosmosDB
 * @author Debbie Dash
 */
import { CosmosDbStorage } from 'botbuilder-azure';
import { ChatLog } from './chatlog';
const uuid = require('uuid/v4');
import  * as moment from 'moment-timezone';

export class ChatLogger {

    botId: string;
    cosmosDbStorage: CosmosDbStorage;

    constructor(botConfig) {
        const env = process.env.ENVIRONMENT.toLowerCase();
        this.botId = 'HollyBot';
        // Don't connect to CosmosDb if local environment
        if (env !== 'local') {
            const chatLogsEnv = (env !== 'prod') ? 'dev' : 'prod';
            // Connect to dev CosmosDb for environments except prod
            const cosmosDbConfig = botConfig.findServiceByNameOrId(`hollycosmosdb`);
            let options = {
                serviceEndpoint: cosmosDbConfig.endpoint,
                authKey: cosmosDbConfig.key,
                databaseId: cosmosDbConfig.database,
                collectionId: cosmosDbConfig.collection
            };
            this.cosmosDbStorage = new CosmosDbStorage(options);
        }
    }

    private baseDocument(activity) {
        const ts = moment();
        let data = {
            botId: this.botId,
            conversationId: this.getConversationId(activity),
            timeStamp: ts.valueOf(),
            date: ts.tz('America/Chicago').format('MM/D/YYYY'),
            time: ts.tz('America/Chicago').format('h:mm:ss a'),
            version: '1.0'
        };
        return new ChatLog(data);
    }

    private writeDocument(document) {
        const id = uuid();
        if (process.env.ENVIRONMENT !== 'local') {
            this.cosmosDbStorage.write({ [id]: document });
        } else {
            // Print to console for local debugging
            console.log({ [id]: document });
        }
    }

    private getConversationId(activity) {
        let id = '';
        if (activity.conversation) {
            id = activity.conversation.id;
            if (id.indexOf('|') !== -1) {
                id = activity.conversation.id.replace(/\|.*/, '');
            }
        }
        return id;
    }

    logActivity(activity) {
        if (!activity) {
            throw new Error('Activity is required.');
        }
        if (activity.type === 'message') {
            const message = activity;
            let document = this.baseDocument(activity);
            document = Object.assign({
                messageType: 'text',
                from: message.from.name || message.from.role,
                // Remove excess spaces
                message: message.text ? message.text.replace(/\s{2,}/, ' ') : message.text
            }, document);
            if (message.text) {
                this.writeDocument(document);
            }
        }
    }

    // logDispatcherResult(turnContext, dispatcherResult) {
    //     if (!dispatcherResult) return;
    //     let document = this.baseDocument(turnContext.activity);
    //     let additionalFields;
    //     if (dispatcherResult.type === 'LUIS') {
    //         additionalFields = {
    //             messageType: 'luis',
    //             luisSource: 'formerAssociateLuis',
    //             luisUtterance: turnContext.activity.text,
    //             luisIntent: dispatcherResult.result.intent,
    //             luisScore: dispatcherResult.score
    //         };
    //     } else if (dispatcherResult.type === 'QNA') {
    //         additionalFields = {
    //             messageType: 'qna',
    //             qnaSource: 'formerAssociateQna',
    //             qnaQuestion: turnContext.activity.text,
    //             qnaResponse: dispatcherResult.result.answer,
    //             luisScore: dispatcherResult.score
    //         };
    //     }
    //     document = Object.assign(additionalFields, document);
    //     if (document.luisIntent || document.qnaResponse) {
    //         this.writeDocument(document);
    //     }
    // }

    logUserFeedback(turnContext, response) {
        let document = this.baseDocument(turnContext.activity);
        document = Object.assign({
            messageType: 'userFeedback',
            response: response
        }, document);
        this.writeDocument(document);
    }
}