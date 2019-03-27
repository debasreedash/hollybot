import { ComponentDialog, WaterfallDialog, WaterfallStepContext } from 'botbuilder-dialogs';
import { sharedResponses } from '../shared/shared_responses';
import { responses } from './responses';
import { SitDialog } from './sitDialog';
import { StandDialog } from './standDialog';
import { SitStandDialog } from './sitStandDialog';

export class BackPainDialog extends ComponentDialog {

    constructor(dialogId: string) {
        super(dialogId);

        if (!dialogId) {
            throw Error('Missing parameter. dialogId is required.');
        }

        this.addDialog(new WaterfallDialog('mainBackPainDialog', [
            this.positionPrompt.bind(this),
            this.startChildDialog.bind(this)
        ]));

        this.addDialog(new SitDialog('sitDialog'));
        this.addDialog(new StandDialog('standDialog'));
        this.addDialog(new SitStandDialog('sitStandDialog'));
    }

    private positionPrompt = async (step: WaterfallStepContext) => {
        const options = {
            prompt: 'Does it hurt when you sit or stand for extended periods of time?',
            choices: ['Sit', 'Stand', 'Both']
        };
        return step.prompt('choicePrompt', options);
    }

    private startChildDialog = async (step: WaterfallStepContext) => {
        const result = step.result.value.toLowerCase();
        switch (result) {
            case 'sit':
                return step.beginDialog('sitDialog');
            case 'stand':
                return step.beginDialog('standDialog');
            case 'both':
                return step.beginDialog('sitStandDialog');
            default:
                await step.context.sendActivity(sharedResponses.DO_NOT_KNOW_HOW_TO_HELP);
                return step.context.sendActivity(responses.HELPFUL_LINKS);
        }
    }

}