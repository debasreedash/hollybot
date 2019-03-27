
import { Dialog, PromptOptions, WaterfallDialog, WaterfallStepContext } from 'botbuilder-dialogs';
import { responses } from './responses';
import { ActivityTypes } from 'botbuilder';

export class HeadacheDialog extends WaterfallDialog {

    constructor(dialogId: string) {
        super(dialogId);
        if (!dialogId) { throw Error('Missing parameter.  dialogId is required'); }

        this.addStep(this.rankPainCard.bind(this));
        this.addStep(this.painCausePrompt.bind(this));
        this.addStep(this.headacheSymptomPrompt.bind(this));
        this.addStep(this.handleHeadacheSymptom.bind(this));
        this.addStep(this.helpHandler.bind(this));
        this.addStep(this.handleQna.bind(this));
        this.addStep(this.endQna.bind(this));
    }

    private rankPainCard = async (step: WaterfallStepContext) => {
        const options: PromptOptions = {
            prompt: 'Can you rank the severity of your pain?',
            choices: ['Low', 'Mild', 'Severe']
        };
        return await step.prompt('choicePrompt', options);
    }

    private painCausePrompt = async (step: WaterfallStepContext) => {
        const result = step.result.value.toLowerCase();
        switch (result) {
            case 'low':
            case 'mild':
                return step.next();
            case 'severe':
                await step.context.sendActivity(responses.SEVERE_PAIN);
                return await step.replaceDialog('helpDialog');
        }
    }

    private headacheSymptomPrompt = async (step: WaterfallStepContext) => {
        const options: PromptOptions = {
            prompt: 'Do you know what may be causing your headache?',
            choices: ['Stress', 'Physical', 'Sinus', 'Not Sure']
        };
        return await step.prompt('choicePrompt', options);
    }

    private handleHeadacheSymptom = async (step: WaterfallStepContext) => {
        const result = step.result.value.toLowerCase();
        await step.context.sendActivity({type: ActivityTypes.Typing});
        switch (result) {
            case 'stress':
                await step.context.sendActivity(responses.STRESS_RESPONSE);
                return await step.beginDialog('helpDialog');
            case 'physical':
                await step.context.sendActivity(responses.PHYSICAL_RESPONSE);
                return await step.beginDialog('helpDialog');
            case 'sinus':
                await step.context.sendActivity(responses.SINUS_RESPONSE);
                return await step.beginDialog('helpDialog');
            case 'not sure':
                return await step.replaceDialog('qnaDialog', { kb: 'qnamakerService' });
                break;
            case 'severe':
                await step.context.sendActivity(responses.SEVERE_PAIN);
                return await step.next();
        }
    }

    private helpHandler = async (step: WaterfallStepContext) => {
        return await step.prompt('textPrompt', `Can you tell me in a few words what's going on?`);
    }

    private handleQna = async (step: WaterfallStepContext) => {
        return await step.beginDialog('qnaDialog');
    }

    private endQna = async (step: WaterfallStepContext) => {
        return await step.replaceDialog('helpDialog', { endConversation: true });
    }

}