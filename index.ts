import * as functions from "firebase-functions";
const admin = require('firebase-admin');

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//

class payload {
  
}

export const helloWorld = functions.https.onRequest((request, response) => {
  functions.logger.info("Hello logs!", {structuredData: true});
  response.send("Hello from Firebase!");
});

export const sendNotification = functions.https.onRequest((request, response) => {
  const 
  const messageResponse = await admin.messaging().sendToDevice(tokens, payload);
}
