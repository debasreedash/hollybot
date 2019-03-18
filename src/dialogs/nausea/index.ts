import { PromptOptions, WaterfallDialog, WaterfallStepContext } from 'botbuilder-dialogs';

export class NauseaDialog extends WaterfallDialog {

    constructor(dialogId: string) {
        super(dialogId);
        if (!dialogId) { throw Error('Missing parameter. dialogId is required.')};

        this.addStep(this.pregnancyPrompt.bind(this));
        this.addStep(this.handlePregnacyPrompt.bind(this));
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
                return step.context.sendActivity(`Have a glass of lemon infused water`);
                break;
            case 'no':
                return step.next();
                break;
            default:
                return step.next();
                break;
        }
    }
}