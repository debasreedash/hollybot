import { PromptOptions, WaterfallDialog, WaterfallStepContext, ComponentDialog } from 'botbuilder-dialogs';
import { responses } from './responses';
import { sharedResponses } from '../shared/shared_responses';
import { HelpOptions } from '../shared/options';

export class NauseaDialog extends ComponentDialog {

    constructor(dialogId: string) {
        super(dialogId);
        if (!dialogId) { throw Error('Missing parameter. dialogId is required.')};


        this.addDialog(new WaterfallDialog('pregnancyDialog', [
            this.pregnancyPrompt.bind(this),
            this.handlePregnancyPrompt.bind(this)
        ]));

        this.addDialog(new WaterfallDialog('alcoholConsumptionDialog', [
            this.alcoholConsumptionPrompt.bind(this),
            this.handleAlcoholConsumptionPrompt.bind(this)
        ]));

        this.addDialog(new WaterfallDialog('helpPregnancyDialog', [
            this.didThatHelpPrompt.bind(this),
            this.handlePregnancyHelpPrompt.bind(this),
            this.didThatHelpPrompt.bind(this),
            this.handleSecondPregnancyHelp.bind(this)
        ]));

        this.addDialog(new WaterfallDialog('anythingElseDialog', [
            this.anythingElsePrompt.bind(this),
            this.handleAnythingElsePrompt.bind(this)
        ]));

        this.addDialog(new WaterfallDialog('largeMealDialog', [
            this.largeMealPrompt.bind(this),
            this.handleLargeMealPrompt.bind(this)
        ]))
    }

    private pregnancyPrompt = async (step: WaterfallStepContext) => {
        const options: PromptOptions = {
            prompt: 'Are you pregnant?',
            choices: ['Yes', 'No']
        };
        return await step.prompt('choicePrompt', options);
    };

    private handlePregnancyPrompt = async (step: WaterfallStepContext) => {
        const result = step.result.value.toLowerCase();
        switch (result) {
            case 'yes':
                await step.context.sendActivity(responses.PREGNANCY_RESPONSE);
                return await step.replaceDialog('helpPregnancyDialog');
            case 'no':
                return await step.replaceDialog('alcoholConsumptionDialog');
            default:
                await step.context.sendActivity(sharedResponses.DO_NOT_KNOW_HOW_TO_HELP);
                return await step.replaceDialog('mainMenuDialog');
        }
    };

    private didThatHelpPrompt = async (step: WaterfallStepContext<HelpOptions>) => {
        let prompt = 'Did that help?';
        if (step.result) {
            prompt = step.result.prompt;
        }
        const options: PromptOptions = {
            prompt: prompt,
            choices: ['Yes', 'No']
        };
        return await step.prompt('choicePrompt', options);
    };

    private handlePregnancyHelpPrompt = async (step: WaterfallStepContext) => {
        const result = step.result.value.toLowerCase();
        switch (result) {
            case 'yes':
                return await step.replaceDialog('anythingElseDialog');
            case 'no':
                await step.context.sendActivity(responses.COLD_COMPRESS_RESPONSE);
                return await step.next({prompt: `Did that make you feel better?`});
            default:
                return await step.next();
        }
    };

    private handleSecondPregnancyHelp = async (step: WaterfallStepContext) => {
        const result = step.result.value.toLowerCase();
        switch (result) {
            case 'yes':
                return await step.replaceDialog('anythingElseDialog');
            case 'no':
                await step.context.sendActivity(responses.MEDICATION_RESPONSE);
                await step.context.sendActivity(responses.MORE_INFORMATION);
                return await step.replaceDialog('mainMenuDialog', {
                    prompt: `Let me take you back to the main menu. You can always end the chat by typing in 'end chat'`
                });
            default:
                await step.context.sendActivity(sharedResponses.DO_NOT_KNOW_HOW_TO_HELP);
                return await step.replaceDialog('mainMenuDialog');
        }
    };

    private alcoholConsumptionPrompt = async (step: WaterfallStepContext) => {
        const options: PromptOptions = {
            prompt: 'Did you consume large amounts of alcohol in the last 24 hours?',
            choices: ['Yes', 'No']
        };
        return await step.prompt('choicePrompt', options);
    };

    private handleAlcoholConsumptionPrompt = async (step: WaterfallStepContext) => {
        const result = step.result.value.toLowerCase();
        switch (result) {
            case 'yes':
                await step.context.sendActivity(responses.ALCOHOL_CONSUMPTION_RESPONSE);
                return await step.replaceDialog('helpDialog', {
                    prompt: `Did that help you feel better?`
                });
            case 'no':
                return await step.replaceDialog('largeMealDialog');
            default:
                await step.context.sendActivity(sharedResponses.DO_NOT_KNOW_HOW_TO_HELP);
                return await step.replaceDialog('mainMenuDialog');
        }
    }

    private largeMealPrompt = async (step: WaterfallStepContext) => {
        const options: PromptOptions = {
            prompt: 'Did you have a large meal a few hours ago?',
            choices: ['Yes', 'No']
        };
        return await step.prompt('choicePrompt', options);
    }

    private handleLargeMealPrompt = async (step: WaterfallStepContext) => {
        const result = step.result.value.toLowerCase();
        switch (result) {
            case 'yes':
                await step.context.sendActivity(responses.LARGE_MEAL_RESPONSE);
                return await step.replaceDialog('helpDialog');
            case 'no':
                await step.context.sendActivity(responses.CANNOT_FIND_SOLUTION);
                return await step.replaceDialog('mainMenuDialog');
            default:
                await step.context.sendActivity(sharedResponses.DO_NOT_KNOW_HOW_TO_HELP);
                return await step.replaceDialog('mainMenuDialog');
        }
    };

    private anythingElsePrompt = async (step: WaterfallStepContext) => {
        const options: PromptOptions = {
            prompt: `Great! I'm happy to hear that. Is there anything else I can help you with?`,
            choices: ['Yes', 'No']
        };
        return await step.prompt('choicePrompt', options);
    };

    private handleAnythingElsePrompt = async (step: WaterfallStepContext) => {
        const result = step.result.value.toLowerCase();
        switch (result) {
            case 'yes':
                return await step.replaceDialog('mainMenuDialog');
            case 'no':
                return await step.replaceDialog('feedbackDialog');
            default:
                await step.context.sendActivity(sharedResponses.DO_NOT_KNOW_HOW_TO_HELP);
                return await step.replaceDialog('mainMenuDialog');
        }
    }
}