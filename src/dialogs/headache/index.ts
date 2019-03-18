
import { Dialog, PromptOptions, WaterfallDialog, WaterfallStepContext } from 'botbuilder-dialogs';
import { responses } from './responses';

export class HeadacheDialog extends WaterfallDialog {

    constructor(dialogId: string) {
        super(dialogId);
        if (!dialogId) { throw Error('Missing parameter.  dialogId is required'); }

        this.addStep(this.rankPainCard.bind(this));
        this.addStep(this.painCausePrompt.bind(this));
        this.addStep(this.headacheSymptomPrompt.bind(this));
        this.addStep(this.handleHeadacheSymptom.bind(this));
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
                break;
            case 'severe':
                await step.context.sendActivity(responses.SEVERE_PAIN);
                const options = {
                    prompt: responses.SEVERE_PAIN_FOLLOW,
                    choices: ['Yes', 'No']
                };
                return await step.prompt('choicePrompt', options);
        }
    };

    private headacheSymptomPrompt = async (step: WaterfallStepContext) => {
        const options: PromptOptions = {
            prompt: 'Do you know what may be causing your headache?',
            choices: ['Stress', 'Physical', 'Sinus', 'Not Sure']
        };
        return await step.prompt('choicePrompt', options);
    };

    private handleHeadacheSymptom = async (step: WaterfallStepContext) => {
        const result = step.result.value.toLowerCase();
        switch (result) {
            case 'stress':
                await step.context.sendActivity(responses.STRESS_RESPONSE);
                break;
            case 'physical':
                await step.context.sendActivity(responses.PHYSICAL_RESPONSE);
                break;
            case 'sinus':
                await step.context.sendActivity(responses.SINUS_RESPONSE);
                break;
            case 'not sure':
                await step.context.sendActivity(responses.NOT_SURE_RESPONSE);
                break;
            case 'severe':
                await step.context.sendActivity(responses.SEVERE_PAIN);
                break;
        }
        return step.next();
    }

}