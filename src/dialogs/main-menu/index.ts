
import { ChoicePrompt, PromptOptions, WaterfallDialog, WaterfallStepContext } from 'botbuilder-dialogs';

interface MainMenuOptions {
    prompt: string
}

export class MainMenuDialog extends WaterfallDialog {

    constructor(dialogId: string) {
        super(dialogId);
        if (!dialogId) { throw Error('Missing parameter.  dialogId is required'); }

        this.addStep(this.mainMenuPrompt.bind(this));
        this.addStep(this.routeToDialog.bind(this));

    }

    private mainMenuPrompt = async (step: WaterfallStepContext<MainMenuOptions>) =>  {
        let prompt = step.options.prompt || `How can I help you today? You can always end this chat by typing 'end chat'`;
        const options: PromptOptions = {
            prompt: prompt,
            retryPrompt: prompt,
            choices: ['Headache', 'Flu', 'Back Pain', 'Nausea', 'General QnAs']
        };
        return await step.prompt('choicePrompt', options);
    };

    private routeToDialog = async (step: WaterfallStepContext) => {
        const result = step.result.value.toLowerCase();
        switch (result) {
            case 'headache':
                return step.replaceDialog('headacheDialog');
            case 'flu':
                return step.replaceDialog('fluDialog');
            case 'back pain':
                return step.replaceDialog('backPainDialog');
            case 'nausea':
                return step.replaceDialog('nauseaDialog');
            default:
                step.next();
        }
    }

}