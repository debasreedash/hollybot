import { moment } from 'moment-timezone';

export class ChatLog {

    private botId: string;
    private conversationId: string;
    private timeStamp: Date;
    private date: string;
    private time: string;
    private messageType: string;
    private response: string;

    constructor(data: any) {
        const ts = moment();

        this.botId = data.botId;
        this.conversationId = data.conversationId;
        this.timeStamp = ts.valueOf();
        this.date = ts.tz('America/Chicago').format('MM/D/YYYY');
        this.time = ts.tz('America/Chicago').format('h:mm:ss a');
    }

    setMessageType(message, response) {
        this.messageType = message;
        this.response = response;
    }

}