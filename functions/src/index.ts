/** Program containing handlers for API calls */
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";
import * as jwt from "jsonwebtoken";
// import * as requests from "request-promise-native";

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

/* API for sending notification to device. */
export const sendNotification =
    functions.https.onRequest(async (request, response) => {
      if ((!request.headers.authorization ||
           !request.headers.authorization.startsWith("Bearer ")) &&
          !(request.cookies && request.cookies.__session)) {
        functions.logger.error(
            "No Firebase ID token was passed as a Bearer token.",
            "Make sure you authorize your request by providing the following:",
            "Authorization: Bearer <Firebase ID Token>",
            "or by passing a \"__session\" cookie."
        );
        response.status(403).send("Unauthorized");
        return;
      }

      let idToken;
      if (request.headers.authorization &&
          request.headers.authorization.startsWith("Bearer ")) {
        // Read the ID Token from the Authorization header.
        idToken = request.headers.authorization.split("Bearer ")[1];
      } else {
        // No cookie
        response.status(403).send("Unauthorized");
        return;
      }

      try {
        const publicKey = "TODO: Insert public key";
        // const decodedIdToken = await admin.auth().verifyIdToken(idToken);
        // functions.logger.log("ID Token correctly decoded", decodedIdToken);
        jwt.verify(idToken, publicKey, {algorithms: ["RS256"]},
            async (err, decoded) => {
              if ((!decoded) || (decoded.iss == "https://securetoken.google.com/vocal-gist-315804")) {
                if (request.body.tokens) {
                  response.status(200).send("Notification sent.");
                  const tokens: string[] =
                    request.body.tokens as string[];
                  functions.logger.log(tokens);
                  console.log(tokens);
                  /* const payload = {
                    notification: {
                      title: "Someone is at the door",
                      body: "Open notification for more details",
                    },
                    data: {
                      imageData: request.body.imageData,
                    },
                  };
                  const options = {
                    timeToLive: 300,
                  }; */
                  const message = {
                    notification: {
                      title: "Someone is at the door",
                      body: "Open notification for more details",
                    },
                    android: {
                      notification: {
                        click_action: "OpenCamView",
                        channel_id: "DoorBellChannel",
                        notification_priority: "PRIORITY_MAX",
                        tag: "DoorNotification",
                      },
                    },
                    tokens: tokens,
                  };
                  const messageResponse = await
                  admin.messaging().sendMulticast(message);
                  functions.logger.log(messageResponse);
                } else {
                  response.status(400).send("Invalid token.");
                }
              } else {
                response.status(403).send(err);
              }
            });
      } catch (error) {
        functions.logger
            .error("Error while verifying Firebase ID token:", error);
        response.status(403).send("Unauthorized");
      }
    });
/*
const publicKeyget = requests.get({
uri: "https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com",
});
admin.messaging().sendToDevice(tokens, payload, options);
functions.logger.log(publicKeyget); */
