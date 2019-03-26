import { ComponentDialog, PromptOptions, WaterfallDialog, WaterfallStepContext } from 'botbuilder-dialogs';
import { responses } from './responses';

export class FluDialog extends ComponentDialog {

    constructor(dialogId) {
        super(dialogId);

        this.addDialog(new WaterfallDialog('mainFluDialog', [
            this.feverPrompt.bind(this),
            this.handleFeverPrompt.bind(this)
        ]));

        this.addDialog(new WaterfallDialog('allergiesDialog', [
            this.allergyPrompt.bind(this),
            this.handleAllergyPrompt.bind(this)
        ]));

        this.addDialog(new WaterfallDialog('potentialFluDialog', [
            this.painPrompt.bind(this),
            this.handlePainPrompt.bind(this),
        ]));

        this.addDialog(new WaterfallDialog('fluSymptomsDialog', [
            this.fluSymptomsPrompt.bind(this),
            this.handleFluSymptomsPrompt.bind(this)
        ]));

        this.addDialog(new WaterfallDialog('otherRemediesDialog', [
            this.otherRemediesPrompt.bind(this),
            this.handleOtherRemediesPrompt.bind(this),
        ]))
    }

    private feverPrompt = async (step: WaterfallStepContext) => {
        const options: PromptOptions = {
            prompt: 'Do you have a fever?',
            choices: ['Yes', 'No']
        };
        return await step.prompt('choicePrompt', options);
    }

    private handleFeverPrompt = async (step: WaterfallStepContext) => {
        const result = step.result.value.toLowerCase();
        switch (result) {
            case 'yes':
                return await step.beginDialog('potentialFluDialog');
            case 'no':
                return await step.beginDialog('allergiesDialog');

        }
    }

    private allergyPrompt = async (step: WaterfallStepContext) => {
        const options: PromptOptions = {
            prompt: `It doesn't sound like the Flu, do you have a history of allergies?`,
            choices: ['Yes', 'No']
        };
        return await step.prompt('choicePrompt', options);
    }

    private handleAllergyPrompt = async (step: WaterfallStepContext) => {
        const result = step.result.value.toLowerCase();
        switch (result) {
            case 'yes':
                await step.context.sendActivity(responses.ALLERGY_RESPONSE);
                break;
            case 'no':
                await step.context.sendActivity(responses.POTENTIAL_COLD_VIRUS);
                break;
        }
        return await step.replaceDialog('helpDialog');
    }

    private painPrompt = async (step: WaterfallStepContext) => {
        const options: PromptOptions = {
            prompt: `Have you been experiencing body or muscle aches or general fatigue?`,
            choices: ['Yes', 'No']
        };
        return await step.prompt('choicePrompt', options);
    }

    private handlePainPrompt = async (step: WaterfallStepContext) => {
        const result = step.result.value.toLowerCase();
        switch (result) {
            case 'yes':
                await step.context.sendActivity(responses.POTENTIAL_FLU);
                return await step.replaceDialog('otherRemediesDialog');
            case 'no':
                await step.context.sendActivity(responses.POTENTIAL_COLD_VIRUS);
                return step.replaceDialog('helpDialog');
        }
    }

    private fluSymptomsPrompt = async (step: WaterfallStepContext) => {
        const options: PromptOptions = {
            prompt: `Have you had these symptoms for more than two days?`,
            choices: ['Yes', 'No']
        };
        return await step.prompt('choicePrompt', options);
    }

    private handleFluSymptomsPrompt = async (step: WaterfallStepContext) => {
        const result = step.result.value.toLowerCase();
        switch (result) {
            case 'yes':
                await step.context.sendActivity(responses.FLU_REMEDY_OPTION_ONE);
                await step.context.sendActivity(responses.FLU_REMEDY_OPTION_TWO);
                break;
            case 'no':
                await step.context.sendActivity(responses.PRESCRIPTION_MEDS);
                await step.next();
                break;
        }
    }

    private otherRemediesPrompt = async (step: WaterfallStepContext) => {
        const options: PromptOptions = {
            prompt: `Would you like to hear other remedies for the Flu?`,
            choices: ['Yes', 'No']
        };
        return await step.prompt('choicePrompt', options);
    }

    private handleOtherRemediesPrompt = async (step: WaterfallStepContext) => {
        const result = step.result.value.toLowerCase();
        switch (result) {
            case 'yes':
                await step.context.sendActivity(responses.FLU_REMEDY_OPTION_ONE);
                await step.context.sendActivity(responses.FLU_REMEDY_OPTION_TWO);
                break;
            case 'no':
                step.next();
                break;
        }
        return await step.replaceDialog('helpDialog')
    }



}