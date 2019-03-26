import { PromptOptions, WaterfallDialog, WaterfallStepContext } from 'botbuilder-dialogs';
import { sharedResponses } from './shared_responses';

type HandleHelpOptions = { endConversation: boolean };

export class HelpDialog extends WaterfallDialog {

    constructor(dialogId: string) {
        super(dialogId);
        if (!dialogId) { throw Error('Missing parameter.  dialogId is required'); }
        this.addStep(this.promptForHelp.bind(this));
        this.addStep(this.handleHelp.bind(this));
        this.addStep(this.anythingElsePrompt.bind(this));
        this.addStep(this.handleAnythingElsePrompt.bind(this));
    }

    private promptForHelp = async (step: WaterfallStepContext) => {
        const options: PromptOptions = {
            prompt: sharedResponses.DID_THAT_HELP,
            choices: ['Yes', 'No']
        };
        return await step.prompt('choicePrompt', options);
    }

    private handleHelp = async (step: WaterfallStepContext<HandleHelpOptions>) => {
        // console.log('conversation state', this.conversationState);
        const result = step.result.value.toLowerCase();
        switch (result) {
            case 'no':
                if (step.options.endConversation === true) {
                    return await step.replaceDialog('mainMenuDialog');
                } else {
                    break;
                }
            case 'yes':
                await step.context.sendActivity(sharedResponses.SUGGESTION_HELPED);
                break;
        }
        return step.next();
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