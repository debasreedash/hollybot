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
            this.promptLegalAgreement.bind(this),
            this.routeToMenu.bind(this)
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
            retryPrompt: 'You must agree to the legal agreement so I can help you.',
            choices: ['Yes', 'No']
        });
    }

    private routeToMenu = async (step: WaterfallStepContext) => {
        if (VALIDATION_SUCCEEDED) {
            return step.replaceDialog('mainMenuDialog');
        } else {
            return step.next();
        }
    }

    private validateLegalAgreement = async ({ recognized }: PromptValidatorContext<FoundChoice>) => {
        const value = recognized.value ? recognized.value.value : '';
        if (value !== 'Yes') {
            return VALIDATION_FAILED;
        } else {
            return VALIDATION_SUCCEEDED;
        }
    }

}
