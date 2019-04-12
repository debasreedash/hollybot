
import { Dialog, PromptOptions, WaterfallDialog, WaterfallStepContext } from 'botbuilder-dialogs';
import { responses } from './responses';
import { ActivityTypes } from 'botbuilder';
import { sharedResponses } from '../shared/shared_responses';

export class HeadacheDialog extends WaterfallDialog {

    constructor(dialogId: string) {
        super(dialogId);
        if (!dialogId) { throw Error('Missing parameter.  dialogId is required'); }

        this.addStep(this.rankPainCard.bind(this));
        this.addStep(this.painCausePrompt.bind(this));
        this.addStep(this.headacheSymptomPrompt.bind(this));
        this.addStep(this.handleHeadacheSymptom.bind(this));
        this.addStep(this.didThatHelpPrompt.bind(this));
        this.addStep(this.helpHandler.bind(this));
        this.addStep(this.handleQna.bind(this));
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
            choices: ['Stress', 'Pressure', 'Sinus', 'Not Sure']
        };
        return await step.prompt('choicePrompt', options);
    }

    private handleHeadacheSymptom = async (step: WaterfallStepContext) => {
        const result = step.result.value.toLowerCase();
        await step.context.sendActivity({type: ActivityTypes.Typing});
        switch (result) {
            case 'stress':
                await step.context.sendActivity(responses.STRESS_RESPONSE);
                break;
            case 'pressure':
                await step.context.sendActivity(responses.PRESSURE_RESPONSE);
                break;
            case 'sinus':
                await step.context.sendActivity(responses.SINUS_RESPONSE);
                break;
            case 'not sure':
                return await step.replaceDialog('qnaDialog', { kb: 'headacheKB' });
        }
        return await step.next();
    }

    private didThatHelpPrompt = async (step: WaterfallStepContext) => {
        let prompt = 'Did that work?';
        const options: PromptOptions = {
            prompt: prompt,
            choices: ['Yes', 'No']
        };
        return await step.prompt('choicePrompt', options);
    }

    private helpHandler = async (step: WaterfallStepContext) => {
        const result = step.result.value.toLowerCase();
        switch (result) {
            case 'yes':
                return await step.replaceDialog('mainMenuDialog');
            case 'no':
                return await step.next();
            default:
                await step.context.sendActivity(sharedResponses.DO_NOT_KNOW_HOW_TO_HELP);
                return await step.replaceDialog('mainMenuDialog');
        }
    }

    private handleQna = async (step: WaterfallStepContext) => {
        return await step.replaceDialog('qnaDialog', {
            helpLink: `You can also find more information on [Everyday Health](https://www.everydayhealth.com/headache-migraine/fast-headache-relief.aspx)`,
            kb: 'headacheKB'
        });
    }

}