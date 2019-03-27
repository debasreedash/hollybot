import { Dialog, DialogTurnResult, WaterfallDialog, WaterfallStepContext } from 'botbuilder-dialogs';
import { QnAMaker, QnAMakerOptions } from 'botbuilder-ai';
import { BotConfiguration, IQnAService } from 'botframework-config';
import { StatePropertyAccessor, ConversationState } from 'botbuilder';

const QNA_CONFIGURATION = 'qnamakerService';
const QNA_CONFIDENCE_THRESHOLD = 0.5;

interface QnADialogOptions {
    kb: string,
    prompt: string
}

export class QnaDialog extends WaterfallDialog {

    private botConfig: BotConfiguration;
    private kb: StatePropertyAccessor<string>;

    constructor(dialogId, botConfig, conversationState: ConversationState) {
        super(dialogId);
        if (!dialogId) { throw Error('Missing parameter.  dialogId is required'); }

        this.kb = conversationState.createProperty('kb');

        this.botConfig = botConfig;
        this.addStep(this.promptQnA.bind(this));
        this.addStep(this.handleQnA.bind(this));
    }

    private promptQnA = async (step: WaterfallStepContext<QnADialogOptions>) => {
        console.log ('kb', step.options.kb);
        await this.kb.set(step.context, step.options.kb);
        let prompt = step.options.prompt || `Can you tell me in a few words what's going on?`;
        return await step.prompt('textPrompt', prompt);
    }

    private handleQnA = async (step: WaterfallStepContext) => {
        // Call QnA Maker and get results.
        console.log('result', step.result);
        const kb = await this.kb.get(step.context) || QNA_CONFIGURATION;
        const qnaConfig = this.botConfig.findServiceByNameOrId(kb) as IQnAService;
        if (!qnaConfig || !qnaConfig.kbId) {
            throw new Error(`QnA Maker application information not found in .bot file. Please ensure you have all required QnA Maker applications created and available in the .bot file. See readme.md for additional information\n`);
        }
        const qnaRecognizer = new QnAMaker({
            knowledgeBaseId: qnaConfig.kbId,
            endpointKey: qnaConfig.endpointKey,
            host: qnaConfig.hostname
        });

        const qnaOptions = {
            scoreThreshold: QNA_CONFIDENCE_THRESHOLD
        };
        const qnaResult = await qnaRecognizer.getAnswers(step.context, qnaOptions);
        console.log('qna result', qnaResult);
        if (!qnaResult || qnaResult.length === 0 || !qnaResult[0].answer) {
            // No answer found.
            await step.context.sendActivity(`Sorry, I do not know how to help you with that. I'm still learning..Check back with me later`);
            await step.context.sendActivity(`Follow [this link](https://www.bing.com/search?q=${ step.result }) to search the web!`);
            return await step.replaceDialog('mainMenuDialog');
        } else {
            // respond with qna result
            await step.context.sendActivity(await qnaResult[0].answer);
            return await step.replaceDialog('helpDialog', { endConversation: true });
        }
    }
}