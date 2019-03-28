// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { WelcomeCard } from './dialogs/welcome';
import { GreetingDialog } from './dialogs/greeting';
import { ActivityTypes, CardFactory, ConversationState, StatePropertyAccessor, TurnContext } from 'botbuilder';
import { ChoicePrompt, DialogSet, DialogState, TextPrompt } from 'botbuilder-dialogs';
import { MainMenuDialog } from './dialogs/main-menu';
import { HeadacheDialog } from './dialogs/headache';
import { NauseaDialog } from './dialogs/nausea';
import { QnAMaker, QnAMakerOptions } from 'botbuilder-ai';
import { QnaDialog } from './dialogs/shared/qnadialog';
import { BackPainDialog } from './dialogs/back-pain/backPainDialog';
import { FluDialog } from './dialogs/flu';
import { HelpDialog } from './dialogs/shared/help';
import { FeedbackDialog } from './dialogs/feedback';
import { BotConfiguration } from 'botframework-config';
import { ChatLogger } from './dialogs/shared/chatlogger';

const GREETING_DIALOG = 'greetingDialog';
const MAIN_MENU_DIALOG = 'mainMenuDialog';
const HEADACHE_DIALOG = 'headacheDialog';
const NAUSEA_DIALOG = 'nauseaDialog';
const BACK_PAIN_DIALOG = 'backPainDialog';
const FLU_DIALOG = 'fluDialog';
const HELP_DIALOG = 'helpDialog';
const FEEDBACK_DIALOG = 'feedbackDialog';
const QNA_DIALOG = 'qnaDialog';
const DIALOG_STATE_PROPERTY = 'dialogState';

export class MyBot {

    private dialogState: StatePropertyAccessor<DialogState>;
    private conversationState: ConversationState;
    private dialogs: DialogSet;
    private qnaMaker: QnAMaker;
    private logger: ChatLogger;

    constructor(conversationState: ConversationState, botConfig: BotConfiguration, private env: string) {

        if (!conversationState) {
            throw new Error('Missing parameter.  conversationState is required');
        }

        this.dialogState = conversationState.createProperty(DIALOG_STATE_PROPERTY);
        this.logger = new ChatLogger(botConfig);
        this.dialogs = new DialogSet(this.dialogState);
        this.dialogs.add(new GreetingDialog(GREETING_DIALOG));
        this.dialogs.add(new MainMenuDialog(MAIN_MENU_DIALOG));
        this.dialogs.add(new HeadacheDialog(HEADACHE_DIALOG));
        this.dialogs.add(new NauseaDialog(NAUSEA_DIALOG));
        this.dialogs.add(new BackPainDialog(BACK_PAIN_DIALOG));
        this.dialogs.add(new FluDialog(FLU_DIALOG));
        this.dialogs.add(new HelpDialog(HELP_DIALOG));
        this.dialogs.add(new QnaDialog(QNA_DIALOG, botConfig, conversationState));
        // this.dialogs.add(new FeedbackDialog(FEEDBACK_DIALOG, logger));
        this.dialogs.add(new FeedbackDialog(FEEDBACK_DIALOG, botConfig));


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
        let activity = context.activity;

        //TODO: add logger here
        this.logger.logActivity(activity);

        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types
        const dc = await this.dialogs.createContext(context);
        switch (activity.type) {
            case ActivityTypes.Message:
                const utterance = (activity.text || '').trim().toLowerCase();
                if (['cancel', 'bye', 'quit'].includes(utterance)) {
                    if (dc.activeDialog) {
                        await dc.cancelAllDialogs();
                        await dc.context.sendActivity(`Okay bye!`);
                    }
                }
                if (['death', 'dead', 'dying', 'emergency'].includes(utterance)) {
                    if (dc.activeDialog) {
                        await dc.context.sendActivity(`Please call 911 immediately. Take care!`);
                        await dc.cancelAllDialogs();
                    }
                }
                await dc.continueDialog();
                break;

            case ActivityTypes.Event:
                if (activity.name === 'webchat/join') {
                    const welcomeCard = CardFactory.adaptiveCard(WelcomeCard);
                    await context.sendActivity({ attachments: [welcomeCard] });
                    await dc.beginDialog(GREETING_DIALOG);
                }
                break;

            default:
                if (this.env !== 'production') {
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
                                this.logger.logActivity(activity);
                                await dc.beginDialog(GREETING_DIALOG);
                            }
                        }
                    }
                }
                break;
        }
        await this.conversationState.saveChanges(context, false);
    }
}
