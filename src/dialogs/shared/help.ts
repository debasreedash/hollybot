
import { ActivityTypes, CardFactory, ConversationState } from 'botbuilder';
import { PromptOptions, WaterfallDialog, WaterfallStepContext } from 'botbuilder-dialogs';
import { sharedResponses } from './shared_responses';

type HandleHelpOptions = { endConversation: boolean };

export class HelpDialog extends WaterfallDialog {

    private conversationState: ConversationState;

    constructor(dialogId: string, conversationState: ConversationState) {
        super(dialogId);
        if (!dialogId) { throw Error('Missing parameter.  dialogId is required'); }
        this.conversationState = conversationState;
        this.addStep(this.promptForHelp.bind(this));
        this.addStep(this.handleHelp.bind(this));
        this.addStep(this.anythingElse.bind(this));
        this.addStep(this.handleAnythingElse.bind(this));
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
                    await step.context.sendActivity({ attachments: [this.createHeroCard()] });
                    return await step.endDialog('no');
                }
            case 'yes':
                await step.context.sendActivity(sharedResponses.SUGGESTION_HELPED);
                break;
        }
        return step.next();
    }

    private anythingElse = async (step: WaterfallStepContext) => {
        const options: PromptOptions = {
            prompt: sharedResponses.ANYTHING_ELSE,
            choices: ['Yes', 'No']
        };
        return await step.prompt('choicePrompt', options);
    }

    private handleAnythingElse = async (step: WaterfallStepContext) => {
        const result = step.result.value.toLowerCase();
        switch (result) {
            case 'yes':
                return await step.replaceDialog('mainMenuDialog');
            case 'no':
                await step.context.sendActivity({type: ActivityTypes.Typing});
                return await step.context.sendActivity(sharedResponses.GOODBYE);
        }

    }

    private createHeroCard() {
        return CardFactory.heroCard(
              'Headache References',
          ['https://www.webmd.com/migraines-headaches/understanding-headache-treatment-medref#1'],
          ['More Headache Information']);
    }
}