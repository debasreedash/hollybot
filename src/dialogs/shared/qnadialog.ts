import { Dialog } from 'botbuilder-dialogs';
import { QnAMaker, QnAMakerOptions } from 'botbuilder-ai';

const QNA_CONFIGURATION = 'qnamakerService';
const QNA_CONFIDENCE_THRESHOLD = 0.5;

export class QnaDialog extends Dialog {

    private qnaRecognizer: QnAMaker;

    constructor(dialogId, botConfig) {
        super(dialogId);
        if (!dialogId) { throw Error('Missing parameter.  dialogId is required'); }
        if (!botConfig) { throw new Error('Missing parameter.  botConfig is required'); }

        const qnaConfig = botConfig.findServiceByNameOrId(QNA_CONFIGURATION);
        if (!qnaConfig || !qnaConfig.kbId) {
            throw new Error(`QnA Maker application information not found in .bot file. Please ensure you have all required QnA Maker applications created and available in the .bot file. See readme.md for additional information\n`);
        }
        this.qnaRecognizer = new QnAMaker({
            knowledgeBaseId: qnaConfig.kbId,
            endpointKey: qnaConfig.endpointKey,
            host: qnaConfig.hostname
        });
    }

    public async beginDialog(dc, options) {
        // Call QnA Maker and get results.
        const qnaOptions = {
            scoreThreshold: QNA_CONFIDENCE_THRESHOLD
        };
        const qnaResult = await this.qnaRecognizer.getAnswers(dc.context, qnaOptions);
        console.log('qna result', qnaResult);
        if (!qnaResult || qnaResult.length === 0 || !qnaResult[0].answer) {
            // No answer found.
            await dc.context.sendActivity(`I'm still learning.. Sorry, I do not know how to help you with that.`);
            await dc.context.sendActivity(`Follow [this link](https://www.bing.com/search?q=${ dc.context.activity.text }) to search the web!`);
        } else {
            // respond with qna result
            await dc.context.sendActivity(await qnaResult[0].answer);
        }
        return await dc.endDialog();
    }

}