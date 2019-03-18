
import {
    ChoiceFactoryOptions, ChoicePrompt, Dialog, PromptOptions, WaterfallDialog,
    WaterfallStepContext
} from 'botbuilder-dialogs';
import { sharedResponses } from './shared_responses';

export class HelpDialog extends WaterfallDialog {

    constructor(dialogId: string) {
        super(dialogId);

        this.addStep(this.promptForHelp.bind(this));
        this.addStep(this.handleHelp.bind(this));
    }

    private promptForHelp = async (step: WaterfallStepContext) => {
        const options: PromptOptions = {
            prompt: sharedResponses.DID_THAT_HELP,
            choices: ['Yes', 'No']
        };
        return await step.prompt('choicePrompt', options);
    }

    private handleHelp = async (step: WaterfallStepContext) => {
        const result = step.result.value.toLowerCase();
        switch (result) {
            case 'yes':
                step.context.sendActivity(sharedResponses.DID_NOT_HELP);
                break;
            case 'no':
                step.context.sendActivity(sharedResponses.SUGGESTION_HELPED);
                break;
        }
        step.cancelAllDialogs();
    }
}