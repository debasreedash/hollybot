import { WaterfallDialog, WaterfallStepContext } from 'botbuilder-dialogs';
import { responses } from './responses';
import { sharedResponses } from '../shared/shared_responses';

export class SitStandDialog extends WaterfallDialog {

    constructor(dialogId) {
        super(dialogId);

        if (!dialogId) {
            throw Error('Missing parameter. dialogId is required.');
        }

        this.addStep(this.sitAndStandSituationPrompt.bind(this));
        this.addStep(this.handleBothSitAndStandSituation.bind(this));

    }

    private sitAndStandSituationPrompt = async (step: WaterfallStepContext) => {
        const options = {
            prompt: 'What kind of pain is it?',
            choices: ['Constant', 'Stabbing/Shooting', 'Not sure']
        };
        return await step.prompt('choicePrompt', options);
    };

    private handleBothSitAndStandSituation = async (step: WaterfallStepContext) => {
        const result = step.result.value.toLowerCase();
        switch (result) {
            case 'constant':
                await step.context.sendActivity(responses.CONSTANT_PAIN);
                return await step.replaceDialog('backPainHelpDialog');
            case 'stabbing/shooting':
                await step.context.sendActivity(responses.STABBING_SHOOTING_PAIN);
                return await step.replaceDialog('backPainHelpDialog');
            case 'not sure':
                return await step.replaceDialog('backPainHelpDialog');
        }
    }
}