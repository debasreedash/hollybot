import { WaterfallDialog, WaterfallStepContext } from 'botbuilder-dialogs';

export class SitStandDialog extends WaterfallDialog {

    constructor(dialogId) {
        super(dialogId);

        if (!dialogId) {
            throw Error('Missing parameter. dialogId is required.');
        }

        this.addStep(this.handleBothSitAndStandSituation.bind(this));
    }

    private handleBothSitAndStandSituation = async (step: WaterfallStepContext) => {
        const options = {
            prompt: 'What kind of pain is it?',
            choices: ['Constant Pain', 'Stabbing or Shooting pain', 'Not sure']
        };
        return step.prompt('choicePrompt', options);
    };
}