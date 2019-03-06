import {
    ChoicePrompt, ComponentDialog, FoundChoice, PromptValidatorContext, WaterfallDialog, WaterfallStepContext,
} from 'botbuilder-dialogs';

const LEGAL_AGREEMENT_DIALOG = 'legalAgreementDialog';
const LEGAL_AGREEMENT_PROMPT = 'legalAgreementPrompt';
const VALIDATION_SUCCEEDED = true;
const VALIDATION_FAILED = !VALIDATION_SUCCEEDED;

export class GreetingDialog extends ComponentDialog {

    constructor(dialogId) {
        super(dialogId);
        if (!dialogId) { throw Error('Missing parameter.  dialogId is required'); }

        this.addDialog(new WaterfallDialog(LEGAL_AGREEMENT_DIALOG, [
            this.displayLegalAgreement.bind(this),
            this.promptLegalAgreement.bind(this)
        ]));

        this.addDialog(new ChoicePrompt(LEGAL_AGREEMENT_PROMPT, this.validateLegalAgreement));
    }

    private displayLegalAgreement = async (step: WaterfallStepContext) => {
        await step.context.sendActivity(`Before we proceed, please confirm that you will not share any 
            personal information with me such as medical records or social security numbers`);
        return step.next();
    }

    private promptLegalAgreement = async (step: WaterfallStepContext) => {
        return await step.prompt(LEGAL_AGREEMENT_PROMPT, {
            prompt: 'Do you agree?',
            retryPrompt: 'Please select an option from the list',
            choices: ['Yes', 'No']
        });
    }

    private validateLegalAgreement = async (validatorContext: PromptValidatorContext<FoundChoice>) => {
        const { value } = validatorContext.recognized.value;
        console.log('what value', value);
        if (value !== 'Yes') {
            return VALIDATION_FAILED;
        } else {
            return VALIDATION_SUCCEEDED;
        }
    }

}
