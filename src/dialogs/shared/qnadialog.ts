import { WaterfallDialog, WaterfallStepContext } from 'botbuilder-dialogs';
import { QnAMaker, QnAMakerResult, QnAMakerOptions } from 'botbuilder-ai';
import { BotConfiguration, IQnAService } from 'botframework-config';
import { StatePropertyAccessor, ConversationState, TurnContext } from 'botbuilder';

const QNA_CONFIGURATION = 'headacheKB';
const QNA_CONFIDENCE_THRESHOLD = 0.5;

interface QnADialogOptions {
    kb: string,
    prompt: string
}

export class QnaDialog extends WaterfallDialog {

    private botConfig: BotConfiguration;
    private kb: StatePropertyAccessor<string>;
    private qnaServices: Map<string, QnAMaker>;

    constructor(dialogId, botConfig, conversationState: ConversationState) {
        super(dialogId);
        if (!dialogId) { throw Error('Missing parameter.  dialogId is required'); }

        this.kb = conversationState.createProperty('kb');

        this.botConfig = botConfig;
        this.qnaServices = new Map<string, QnAMaker>();
        this.botConfig.services
            .filter(s => s.type === 'qna')
            .forEach(s => {
                let c = s as IQnAService;
                const config = {
                    knowledgeBaseId: c.kbId,
                    endpointKey: c.endpointKey,
                    host: c.hostname
                };
                this.qnaServices.set(c.name, new QnAMaker(config));
            });

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

        let qnaResult: QnAMakerResult[] = [];
        const qnaOptions = {
            scoreThreshold: QNA_CONFIDENCE_THRESHOLD
        };
        switch (kb) {
            case 'general_faq':
                qnaResult = await this.getGeneralFaqAnswers(step.context, qnaOptions);
                break;
            default:
                const qnaRecognizer = this.qnaServices.get(kb);
                if (!qnaRecognizer) {
                    throw new Error(`QnA Maker application information not found in .bot file. Please ensure you have all required QnA Maker applications created and available in the .bot file. See readme.md for additional information\n`);
                }
                qnaResult = await qnaRecognizer.getAnswers(step.context, qnaOptions);
                break;
        }
        console.log('qna result', qnaResult);
        if (!qnaResult || qnaResult.length === 0 || !qnaResult[0].answer) {
            // No answer found.
            await step.context.sendActivity(`Sorry, I do not know how to help you with that. I'm still learning..Check back with me later`);
            await step.context.sendActivity(`Please contact your doctor for more advice.`);
            return await step.replaceDialog('mainMenuDialog');
        } else {
            // respond with qna result
            await step.context.sendActivity(await qnaResult[0].answer);
            return await step.replaceDialog('helpDialog', { endConversation: true });
        }
    };

    private async getGeneralFaqAnswers(context: TurnContext, options: QnAMakerOptions): Promise<QnAMakerResult[]> {
        let promises: Promise<QnAMakerResult[]>[] = [];
        for (const s of this.qnaServices.values())
            promises.push(s.getAnswers(context, options));

        return Promise.all(promises).then(results => {
            return results.filter(r => r.length > 0)
                .map(r => r[0]).sort((a, b) => a.score - b.score)
        })
    }
}