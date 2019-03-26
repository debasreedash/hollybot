
import { WaterfallDialog, WaterfallStepContext } from 'botbuilder-dialogs';
import { responses } from './responses';

export class FeedbackDialog extends WaterfallDialog {

    constructor(dialogId) {
        super(dialogId);

        this.addStep(this.askFeedbackPrompt.bind(this));
        this.addStep(this.handleAskFeedbackPrompt.bind(this));
        this.addStep(this.feedbackPrompt.bind(this));
        this.addStep(this.handleFeedbackPrompt.bind(this));
    }

    private askFeedbackPrompt = async (step: WaterfallStepContext) => {
        const options = {
            prompt: 'Do you have some time to give me feedback?',
            choices: ['Yes', 'No']
        };
        return await step.prompt('choicePrompt', options);
    }

    private handleAskFeedbackPrompt = async (step: WaterfallStepContext) => {
        const result = step.result.value.toLowerCase();
        switch (result) {
            case 'yes':
                return await step.next();
            case 'no':
                return await step.context.sendActivity(`Okay, have an awesome day!!`);
        }
    }

    private feedbackPrompt = async (step: WaterfallStepContext) => {
        const options = {
            prompt: 'How did I do today?',
            choices: ['👍', '👎']
        };
        return await step.prompt('choicePrompt', options);
    }

    private handleFeedbackPrompt = async (step: WaterfallStepContext) => {
        const result = step.result.value.toLowerCase();

        switch (result) {
            case '👍':
                await step.context.sendActivity(responses.GOODBYE);
                break;
            case '👎':
                await step.context.sendActivity(responses.WILL_DO_BETTER);
                break;
        }
        return await step.cancelAllDialogs();
    }
}