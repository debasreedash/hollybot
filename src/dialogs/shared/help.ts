
import {
    ChoiceFactoryOptions, ChoicePrompt, Dialog, DialogState, PromptOptions, WaterfallDialog,
    WaterfallStepContext
} from 'botbuilder-dialogs';
import { sharedResponses } from './shared_responses';
import { ConversationState } from 'botbuilder';

export class HelpDialog extends WaterfallDialog {

    private conversationState: ConversationState;

    constructor(dialogId: string, conversationState: ConversationState) {
        super(dialogId);
        if (!dialogId) { throw Error('Missing parameter.  dialogId is required'); }
        this.conversationState = conversationState;
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
            case 'no':
                console.log('conversation state', this.conversationState);
                await step.context.sendActivity(sharedResponses.DID_NOT_HELP);
                break;
            case 'yes':
                await step.context.sendActivity(sharedResponses.SUGGESTION_HELPED);
                break;
        }
        return step.next();
    }

    private moreInformation(dialogId) {
        switch (dialogId) {

        }
    }
}