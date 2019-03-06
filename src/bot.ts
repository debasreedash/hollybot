// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { WelcomeCard } from './dialogs/welcome/index';
import { GreetingDialog } from './dialogs/greeting/index';
import { ActivityTypes, CardFactory, ConversationState, StatePropertyAccessor, TurnContext} from 'botbuilder';
import { DialogSet, DialogState } from 'botbuilder-dialogs';

const GREETING_DIALOG = 'greetingDialog';
const DIALOG_STATE_PROPERTY = 'dialogState';

export class MyBot {

    private dialogState: StatePropertyAccessor<DialogState>;
    private conversationState: ConversationState;
    private dialogs: DialogSet;

    constructor(conversationState: ConversationState) {

        if (!conversationState) { throw new Error('Missing parameter.  conversationState is required'); }

        this.dialogState = conversationState.createProperty(DIALOG_STATE_PROPERTY);

        this.dialogs = new DialogSet(this.dialogState);
        this.dialogs.add(new GreetingDialog(GREETING_DIALOG));

        this.conversationState = conversationState;
    }

    /**
     * Use onTurn to handle an incoming activity, received from a user, process it, and reply as needed
     *
     * @param {TurnContext} context on turn context object.
     */
    public onTurn = async (context: TurnContext) => {
        // See https://aka.ms/about-bot-activity-message to learn more about the message and other activity types
        const dc = await this.dialogs.createContext(context);
        if (context.activity.type === ActivityTypes.Message) {
            await dc.continueDialog();
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
