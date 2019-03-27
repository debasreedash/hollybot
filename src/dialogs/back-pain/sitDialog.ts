import { WaterfallDialog, WaterfallStepContext } from 'botbuilder-dialogs';
import { responses } from './responses';

export class SitDialog extends WaterfallDialog {

    constructor(dialogId) {
        super(dialogId);

        if (!dialogId) {
            throw Error('Missing parameter. dialogId is required.');
        }

        this.addStep(this.sitPrompt.bind(this));
        this.addStep(this.handleSitPrompt.bind(this));
        this.addStep(this.sleepPrompt.bind(this));
        this.addStep(this.handleSleepPrompt.bind(this));
    }

    private sitPrompt = async (step: WaterfallStepContext) => {
        const options = {
            prompt: 'Does the pain improve while reclining?',
            choices: ['Yes', 'No']
        };
        return await step.prompt('choicePrompt', options);
    };

    private handleSitPrompt = async (step: WaterfallStepContext) => {
        const result = step.result.value.toLowerCase();
        switch (result) {
            case 'yes':
                await step.context.sendActivity(responses.SIT_PROMPT_RESPONSE);
                return await step.replaceDialog('helpDialog');
            case 'no':
                return await step.next();
        }
    };

    private sleepPrompt = async (step: WaterfallStepContext) => {
        const options = {
            prompt: 'How do you Sleep?',
            choices: ['On My Back', 'On My Side', 'On My Stomach']
        };
        return  step.prompt('choicePrompt', options);
    }

    private handleSleepPrompt  = async (step: WaterfallStepContext) => {
        const result = step.result.value.toLowerCase();
        switch (result) {
            case 'on my back':
                await step.context.sendActivity(responses.SIT_BACK_RESPONSE);
                break;
            case 'on my side':
                await step.context.sendActivity(responses.SIT_SIDE_RESPONSE);
                break;
            case 'on my stomach':
                await step.context.sendActivity(responses.SIT_STOMACH_RESPONSE);
                break;
        }
        return await step.replaceDialog('helpDialog');
    }

}