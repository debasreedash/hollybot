
export class ChatLog {

    private botId: string;
    private conversationId: string;
    private timeStamp: Date;
    private date: string;
    private time: string;
    private messageType: string;
    private response: string;

    constructor(data: any) {
        this.botId = data.botId;
        this.conversationId = data.conversationId;
        this.timeStamp = data.timestamp;
        this.date = data.date;
        this.time = data.time;
    }

    setMessageType(message, response) {
        this.messageType = message;
        this.response = response;
    }

}