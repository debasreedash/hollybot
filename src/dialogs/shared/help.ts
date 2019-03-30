import { PromptOptions, WaterfallDialog, WaterfallStepContext } from 'botbuilder-dialogs';
import { sharedResponses } from './shared_responses';
import { HelpOptions } from './options';
import { ConversationState, StatePropertyAccessor } from 'botbuilder';

type HandleHelpOptions = { endConversation: boolean, message: string };

export class HelpDialog extends WaterfallDialog {

    message: string;

    constructor(dialogId: string) {
        super(dialogId);
        if (!dialogId) { throw Error('Missing parameter.  dialogId is required'); }

        this.message = '';

        this.addStep(this.promptForHelp.bind(this));
        this.addStep(this.handleHelp.bind(this));
        this.addStep(this.anythingElsePrompt.bind(this));
        this.addStep(this.handleAnythingElsePrompt.bind(this));
    }

    private promptForHelp = async (step: WaterfallStepContext<HelpOptions>) => {
        let prompt = step.options.prompt || sharedResponses.DID_THAT_HELP;
        if (step.options.message) this.message = step.options.message;
        const options: PromptOptions = {
            prompt: prompt,
            choices: ['Yes', 'No']
        };
        return await step.prompt('choicePrompt', options);
    }

    private handleHelp = async (step: WaterfallStepContext<HandleHelpOptions>) => {
        // console.log('conversation state', this.conversationState);
        const result = step.result.value.toLowerCase();
        switch (result) {
            case 'no':
                console.log('options', step.options);
                if (step.options.endConversation === true) {
                    await step.context.sendActivity(this.message);
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