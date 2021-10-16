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
        const publicKey = "-----BEGIN CERTIFICATE-----\n" +
          "MIIDHDCCAgSgAwIBAgIIDPP+hlnRm74wDQYJKoZIhvcNAQEFBQAwMTEvMC0GA1UE\n" +
          "AxMmc2VjdXJldG9rZW4uc3lzdGVtLmdzZXJ2aWNlYWNjb3VudC5jb20wHhcNMjEw\n" +
          "NjA5MDkyMDIxWhcNMjEwNjI1MjEzNTIxWjAxMS8wLQYDVQQDEyZzZWN1cmV0b2tl\n" +
          "bi5zeXN0ZW0uZ3NlcnZpY2VhY2NvdW50LmNvbTCCASIwDQYJKoZIhvcNAQEBBQAD\n" +
          "ggEPADCCAQoCggEBALvnBUrnwYG71itcw7lAO03vk32fEha+2LUEEaqw2j2tJqBA\n" +
          "A3bKukPH3zjWrI0tz67WCEsc6gwkG6zHigLzU9Bs1vghtqXoe5iZnHi2hFaLELNn\n" +
          "MPyNjSB3mNi5T02Dw+63gTRrAcQ8NN3eXiQpgHtwVVC56uOCa4Jc8AVmuvzMtXNt\n" +
          "pXafACI7IeRazqlGjHUVZOStnMRH9VieE2e7PZFtbrV19ITFbQdHjHLO6V9mB7Qx\n" +
          "kBFuvzJNnGxgf2U1q7poUiDYI12saPVLPeEuJKagkne3LrjCZS6EevxYqEMa0Whf\n" +
          "ZaY9ODGfXc9hYV9Zdw2Scqj8KbEAainS/DbymmUCAwEAAaM4MDYwDAYDVR0TAQH/\n" +
          "BAIwADAOBgNVHQ8BAf8EBAMCB4AwFgYDVR0lAQH/BAwwCgYIKwYBBQUHAwIwDQYJ\n" +
          "KoZIhvcNAQEFBQADggEBAD6gl5LlKlOvU49LNvKKBrIeG7cF4xYgmg1bCUNgg8sg\n" +
          "lF7kce/MG8r1rXZPeqHrfdeIC9dvTLLD5eot1R5c1brv7oA0lZV8s9EPwSaCWJvu\n" +
          "vl688rYloOR8+bbCjoEuaWFF5mh1OGGdnG8eTdzrz0NYCt43oCcb2X1M4vC9v81T\n" +
          "E5OxwTsio+fI369Px9X25klURbXauh6FyUQKnJ8wUoVwvNQAFzmzSAZbTpCA5Z4t\n" +
          "QLRph2KTYIZSveMvytQYet3UtwNRm2+7E5FnLQpphKYp/kh+QtQRg5pVrVO9pvws\n" +
          "HuGEpFaITH6w4qF8MFwYZ/rTo8/+n+8UoIClQUjES5Y=\n" +
          "-----END CERTIFICATE-----\n";
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
