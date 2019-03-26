import { WaterfallDialog, WaterfallStepContext } from 'botbuilder-dialogs';

export class StandDialog extends WaterfallDialog {

    constructor(dialogId) {
        super(dialogId);

        if (!dialogId) {
            throw Error('Missing parameter. dialogId is required.');
        }

        this.addStep(this.handleStandSituation.bind(this));

    }

    private handleStandSituation = async (step: WaterfallStepContext) => {
        const options = {
            prompt: 'Do you do heavy physical work?',
            choices: ['Yes', 'No']
        };
        return step.prompt('choicePrompt', options);
    };

}