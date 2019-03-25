 export class ActivityLogger {

  public async logMessageText(storage, context) {

    const utterance = context.activity;
    if (typeof utterance !== 'undefined' ) {
      var convoString;
      var mainConvoId;
      var convoId;
      var turnCount;
      var preDialog;
      var preState;
      var incDialog;
      var entry;

      const turnNumber = 1;

      console.log(utterance);
      const uText = utterance.text;
      const uTime = utterance.timestamp;

      convoId = utterance.conversation.id;
      convoId = convoId.split('|');
      mainConvoId = convoId[0];
      console.log(mainConvoId);

      const storeItems = await storage.read([mainConvoId]);
      const logItem = storeItems[mainConvoId];

      if (typeof (logItem) !== 'undefined') {
          storeItems[mainConvoId].turnCount++;
          turnCount = storeItems[mainConvoId].turnCount;
          preDialog = storeItems[mainConvoId].preDialog;
          preState = context.turnState;
          console.log(preState);

          for (const k  of preState.values()) {
             incDialog = k.hash;
          }
          if (preDialog === 'skip') {
              entry = {turnNumber: turnCount, interaction: {prompt: 'Disclaimer', text: uText, timestamp: uTime}};
          } else {
              entry = {turnNumber: turnCount, interaction: {text: uText, prompt: preDialog, timestamp: uTime}};
          }
          storeItems[mainConvoId].preDialog = incDialog;
          storeItems[mainConvoId].endtime = uTime;
          storeItems[mainConvoId].UtterranceList.push(entry);
          await storage.write(storeItems);
        } else {
          storeItems[mainConvoId] = {starttime: uTime, preDialog: 'skip' , turnCount: 1, UtterranceList: [{ turnNumber, interaction: { text: uText, timestamp: uTime  } }]};
          await storage.write(storeItems);
       }
    } else {
      console.log('found nothing');
    }
}
}
