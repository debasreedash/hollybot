# hollybot
Holly will your answer health and wellness questions

This bot has been created using [Bot Framework][1], it shows how to create a simple bot that accepts input from the user and echoes it back.

## Prerequisites
- [Node.js][4] version 8.5 or higher
    ```bash
    # determine node version
    node --version
    ```
- Bot Framework emulator is needed to run this locally    

# To run the bot
- Install modules
    ```bash
    npm install or yarn
    ```
- Start the bot
    ```bash
    npm start or yarn start
    ```
    
# Env Vars
```
botFilePath='./hollybot.bot' REQUIRED
botFileSecret=cM/ZssR88TBWXxke0/Ep4kWwUNyg1gt0jUf9dPW8Z6c=
ENVIRONMENT=dev REQUIRED, default dev
DIRECTLINE_SECRET OPTIONAL
NODE_ENV OPTIONAL, default development  
```  

# Testing the bot using Bot Framework Emulator **v4**
[Bot Framework Emulator][5] is a desktop application that allows bot developers to test and debug their bots on localhost or running remotely through a tunnel.

- Install the Bot Framework Emulator version 4.2.0 or greater from [here][6]

## Connect to the bot using Bot Framework Emulator **v4**
- Launch Bot Framework Emulator
- File -> Open Bot Configuration
- Navigate to `hollybot` folder
- Select `hollybot.bot` file

# Deploy the bot to Azure

## Prerequisites
- [Azure Deployment Prerequisites][41]

## Getting Additional Help with Deploying to Azure
To learn more about deploying a bot to Azure, see [Deploy your bot to Azure][40] for a complete list of deployment instructions.



# Further reading
- [Bot Framework Documentation][20]
- [Bot Basics][32]
- [Azure Bot Service Introduction][21]
- [Azure Bot Service Documentation][22]
- [Deploy Your Bot to Azure][40]
- [Azure CLI][7]
- [msbot CLI][9]
- [Azure Portal][10]
- [Language Understanding using LUIS][11]
- [TypeScript][2]
- [Restify][30]
- [dotenv][31]

[1]: https://dev.botframework.com
[2]: https://www.typescriptlang.org
[3]: https://www.typescriptlang.org/#download-links
[4]: https://nodejs.org
[5]: https://github.com/microsoft/botframework-emulator
[6]: https://github.com/Microsoft/BotFramework-Emulator/releases
[7]: https://docs.microsoft.com/cli/azure/?view=azure-cli-latest
[8]: https://docs.microsoft.com/cli/azure/install-azure-cli?view=azure-cli-latest
[9]: https://github.com/Microsoft/botbuilder-tools/tree/master/packages/MSBot
[10]: https://portal.azure.com
[11]: https://www.luis.ai
[20]: https://docs.botframework.com
[21]: https://docs.microsoft.com/azure/bot-service/bot-service-overview-introduction?view=azure-bot-service-4.0
[22]: https://docs.microsoft.com/azure/bot-service/?view=azure-bot-service-4.0
[30]: https://www.npmjs.com/package/restify
[31]: https://www.npmjs.com/package/dotenv
[32]: https://docs.microsoft.com/azure/bot-service/bot-builder-basics?view=azure-bot-service-4.0
[40]: https://aka.ms/azuredeployment
[41]: ./PREREQUISITES.md
