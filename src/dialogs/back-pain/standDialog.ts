import { WaterfallDialog, WaterfallStepContext } from 'botbuilder-dialogs';
import { responses } from './responses';

export class StandDialog extends WaterfallDialog {

    constructor(dialogId) {
        super(dialogId);

        if (!dialogId) {
            throw Error('Missing parameter. dialogId is required.');
        }

        this.addStep(this.standSituationPrompt.bind(this));
        this.addStep(this.handleStandSituation.bind(this));

    }

    private standSituationPrompt = async (step: WaterfallStepContext) => {
        const options = {
            prompt: 'Do you do heavy physical work?',
            choices: ['Yes', 'No']
        };
        return step.prompt('choicePrompt', options);
    };

    private handleStandSituation = async (step: WaterfallStepContext) => {
        const result = step.result.value.toLowerCase();
        switch (result) {
            case 'yes':
                await step.context.sendActivity(responses.CONSTANT_PAIN);
                return await step.replaceDialog('helpDialog');
            case 'no':
                return await step.next();
        }
    };

}