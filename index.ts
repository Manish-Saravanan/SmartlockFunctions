/** Program containing handlers for API calls */
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//

admin.initializeApp();

/*
class Payload {
  data: string;
  device_id: string;

  constructor(data = "", device_id = "") {
    this.data = data;
    this.device_id = device_id;
}
}*/

/** Sample Hello world API call */
export const helloWorld =
    functions.https.onRequest((request, response) => {
      functions.logger.info("Hello logs!", {structuredData: true});
      response.send("Hello from Firebase!");
    });

/** API for sending notification to device. */
export const sendNotification =
    functions.https.onRequest(async (request, response) => {
      if ((!request.headers.authorization ||
          !request.headers.authorization.startsWith("Bearer ")) &&
          !(request.cookies && request.cookies.__session)) {
        response.status(403).send("Unauthorized");
      }

      let idToken;
      if (request.headers.authorization &&
          request.headers.authorization.startsWith("Bearer ")) {
        functions.logger.log("Found \"Authorization\" header");
        // Read the ID Token from the Authorization header.
        idToken = request.headers.authorization.split("Bearer ")[1];
      } else if (request.cookies) {
        functions.logger.log("Found \"__session\" cookie");
        // Read the ID Token from cookie.
        idToken = request.cookies.__session;
      } else {
        // No cookie
        response.status(403).send("Unauthorized");
      }

      try {
        const decodedIdToken = await admin.auth().verifyIdToken(idToken);
        functions.logger.log("ID Token correctly decoded", decodedIdToken);

        const tokens: string[] = ["eSd6eFycQqKmdw6-Kzk11h:APA91bGR" +
          "aH7VDSLt8Kxiwzfxc7jvihFBAhsUUVPh1QoNdpvEDQpvWXsNg7kK9iY" +
          "8yqgZ7ZG0egc4aaIJeEIGjtNEIsAvvJ2Xx4I5rgqou_DwefQH15413d" +
          "x-uNKQ3qsrew8h3Ao3Y9ss"]; // request.body["tokens"];
        for (const token of tokens) {
          // var payload = new Payload("Hello", "lock123")
          const payload = {
            notification: {
              title: "Someone is at the door",
              body: "Open notification to view more details.",
            },
          };
          const messageResponse =
            await admin.messaging().sendToDevice(token, payload);
          console.log(messageResponse);
          response.send(messageResponse);
        }
      } catch (error) {
        functions.logger
            .error("Error while verifying Firebase ID token:", error);
        response.status(403).send("Unauthorized");
      }
    });
