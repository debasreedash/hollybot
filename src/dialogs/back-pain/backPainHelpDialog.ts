import { WaterfallDialog, WaterfallStepContext, PromptOptions } from "botbuilder-dialogs";
import { sharedResponses } from '../shared/shared_responses';
import { responses } from './responses';

export class BackPainHelpDialog extends WaterfallDialog {

    constructor(dialogId) {
        super(dialogId);

        if (!dialogId) {
            throw Error('Missing parameter. dialogId is required.');
        }

        this.addStep(this.didThatHelp.bind(this));
        this.addStep(this.handleBackPainHelp.bind(this));
        this.addStep(this.anythingElsePrompt.bind(this));
        this.addStep(this.handleAnythingElsePrompt.bind(this));
    }

    private didThatHelp = async (step: WaterfallStepContext) => {
        const options: PromptOptions = {
            prompt: sharedResponses.DID_THAT_HELP,
            choices: ['Yes', 'No']
        };
        return await step.prompt('choicePrompt', options);
    }

    private handleBackPainHelp = async (step: WaterfallStepContext) => {
        const result = step.result.value.toLowerCase();
        switch (result) {
            case 'yes':
                return await step.next();
            case 'no':
                await step.context.sendActivity(`I'm sorry I wish I could be of more help!`);
                return await step.replaceDialog('feedbackDialog');
        }
    }

    private anythingElsePrompt = async (step: WaterfallStepContext) => {
        const options: PromptOptions = {
            prompt: sharedResponses.ANYTHING_ELSE,
            choices: ['Yes', 'No']
        };
        return await step.prompt('choicePrompt', options);
    }

    private handleAnythingElsePrompt = async (step: WaterfallStepContext) => {
        const result = step.result.value.toLowerCase();
        switch (result) {
            case 'yes':
                return await step.replaceDialog('mainMenuDialog');
            case 'no':
                return await step.replaceDialog('feedbackDialog');
        }
    }

}