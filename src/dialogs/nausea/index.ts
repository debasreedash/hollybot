import { PromptOptions, WaterfallDialog, WaterfallStepContext } from 'botbuilder-dialogs';
import { responses } from './responses';
import { sharedResponses } from '../shared/shared_responses';

export class NauseaDialog extends WaterfallDialog {

    constructor(dialogId: string) {
        super(dialogId);
        if (!dialogId) { throw Error('Missing parameter. dialogId is required.')};

        this.addStep(this.pregnancyPrompt.bind(this));
        this.addStep(this.handlePregnacyPrompt.bind(this));
        this.addStep(this.alcoholConsumptionPrompt.bind(this));
        this.addStep(this.handleAlcoholConsumptionPrompt.bind(this));
        this.addStep(this.largeMealPrompt.bind(this));
        this.addStep(this.handlelargeMealPrompt.bind(this));
    }

    private pregnancyPrompt = async (step: WaterfallStepContext) => {
        const options: PromptOptions = {
            prompt: 'Are you pregnant?',
            choices: ['Yes', 'No']
        };
        return await step.prompt('choicePrompt', options);
    }

    private handlePregnacyPrompt = async (step: WaterfallStepContext) => {
        const result = step.result.value.toLowerCase();
        switch (result) {
            case 'yes':
                await step.context.sendActivity(responses.PREGNANCY_RESPONSE);
                return step.replaceDialog('helpDialog');
            default:
                return step.next();
        }
    }

    private alcoholConsumptionPrompt = async (step: WaterfallStepContext) => {
        const options: PromptOptions = {
            prompt: 'Did you consume large amounts of alcohol in the last 24 hours?',
            choices: ['Yes', 'No']
        };
        return await step.prompt('choicePrompt', options);
    }

    private handleAlcoholConsumptionPrompt = async (step: WaterfallStepContext) => {
        const result = step.result.value.toLowerCase();
        switch (result) {
            case 'yes':
                await step.context.sendActivity(responses.ALCOHOL_CONSUMPTION_RESPONSE);
                return step.replaceDialog('helpDialog');
            default:
                return step.next();
        }
    }

    private largeMealPrompt = async (step: WaterfallStepContext) => {
        const options: PromptOptions = {
            prompt: 'Did you have a large meal a few hours ago?',
            choices: ['Yes', 'No']
        };
        return await step.prompt('choicePrompt', options);
    }

    private handlelargeMealPrompt = async (step: WaterfallStepContext) => {
        const result = step.result.value.toLowerCase();
        switch (result) {
            case 'yes':
                await step.context.sendActivity(responses.LARGE_MEAL_RESPONSE);
                return step.replaceDialog('helpDialog');
            case 'no':
                await step.context.sendActivity(sharedResponses.DESCRIBE_SYMPTOM);
                return step.replaceDialog('qnaDialog');
            default:
                return step.next();
        }
    }
}