// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { WelcomeCard } from './dialogs/welcome';
import { GreetingDialog } from './dialogs/greeting';
import { ActivityTypes, CardFactory, ConversationState, StatePropertyAccessor, TurnContext} from 'botbuilder';
import { ChoicePrompt, DialogSet, DialogState, TextPrompt } from 'botbuilder-dialogs';
import { MainMenuDialog } from './dialogs/main-menu';
import { HeadacheDialog } from './dialogs/headache';
import { NauseaDialog } from './dialogs/nausea';
import { QnAMaker, QnAMakerEndpoint, QnAMakerOptions } from 'botbuilder-ai';
import { QnaDialog } from './dialogs/shared/qnadialog';
import { BotConfiguration } from 'botframework-config';
import { HelpDialog } from './dialogs/shared/help';

const GREETING_DIALOG = 'greetingDialog';
const MAIN_MENU_DIALOG = 'mainMenuDialog';
const HEADACHE_DIALOG = 'headacheDialog';
const NAUSEA_DIALOG = 'nauseaDialog';
const QNA_DIALOG = 'qnaDialog';
const HELP_DIALOG = 'helpDialog';
const DIALOG_STATE_PROPERTY = 'dialogState';

export class MyBot {

    private dialogState: StatePropertyAccessor<DialogState>;
    private conversationState: ConversationState;
    private dialogs: DialogSet;
    private qnaMaker: QnAMaker;

    constructor(conversationState: ConversationState, botConfig: BotConfiguration) {

        if (!conversationState) { throw new Error('Missing parameter.  conversationState is required'); }

        this.dialogState = conversationState.createProperty(DIALOG_STATE_PROPERTY);

        this.dialogs = new DialogSet(this.dialogState);
        this.dialogs.add(new GreetingDialog(GREETING_DIALOG));
        this.dialogs.add(new MainMenuDialog(MAIN_MENU_DIALOG));
        this.dialogs.add(new HeadacheDialog(HEADACHE_DIALOG));
        this.dialogs.add(new NauseaDialog(NAUSEA_DIALOG));
        this.dialogs.add(new QnaDialog(QNA_DIALOG, botConfig));
        this.dialogs.add(new HelpDialog(HELP_DIALOG, conversationState));

        this.dialogs.add(new ChoicePrompt('choicePrompt'));
        this.dialogs.add(new TextPrompt('textPrompt'));

        this.conversationState = conversationState;
    }

    /**
     * Use onTurn to handle an incoming activity, received from a user, process it, and reply as needed
     *
     * @param {TurnContext} context on turn context object.
     */
    public async onTurn(context: TurnContext) {
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types
        const dc = await this.dialogs.createContext(context);
        if (context.activity.type === ActivityTypes.Message) {

            const utterance = (context.activity.text || '').trim().toLowerCase();

            if (['cancel', 'bye', 'quit'].includes(utterance)) {
                if (dc.activeDialog) {
                    await dc.cancelAllDialogs();
                    await dc.context.sendActivity(`Okay bye!`);
                }
            }

            const qnaOptions: QnAMakerOptions = {
                scoreThreshold: 0.5
            };

            // const qnaResults = []; // await this.qnaMaker.getAnswers(context, qnaOptions);
            // if (qnaResults.length > 0) {
            //     console.log('qna result', qnaResults[0]);
            //     await context.sendActivity(qnaResults[0].answer);
            //     await dc.continueDialog();
            // } else {
            await dc.continueDialog();
            // }
        } else {
            if (context.activity.membersAdded.length !== 0) {
                // Iterate over all new members added to the conversation
                for (const idx in context.activity.membersAdded) {
                    // Greet anyone that was not the target (recipient) of this message
                    // the 'bot' is the recipient for events from the channel,
                    // context.activity.membersAdded == context.activity.recipient.Id indicates the
                    // bot was added to the conversation.
                    if (context.activity.membersAdded[idx].id !== context.activity.recipient.id) {
                        // Welcome user.
                        // When activity type is "conversationUpdate" and the member joining the conversation is the bot
                        // we will send our Welcome Adaptive Card.  This will only be sent once, when the Bot joins conversation
                        // To learn more about Adaptive Cards, see https://aka.ms/msbot-adaptivecards for more details.
                        const welcomeCard = CardFactory.adaptiveCard(WelcomeCard);
                        await context.sendActivity({ attachments: [welcomeCard] });
                        await dc.beginDialog(GREETING_DIALOG);
                    }
                }
            }
        }
        await this.conversationState.saveChanges(context, false);
    }
}
