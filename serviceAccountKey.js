require("dotenv").config();
const privateKeyId = process.env.PRIVATE_KEY_ID;
const privateKEY = process.env.PRIVATE_KEY;
const clientID = process.env.CLIENT_ID;

const serviceAccountKey = {
  type: "service_account",
  project_id: "layjoo-line-bot",
  private_key_id: privateKeyId,
  private_key: privateKEY,
  client_email:
    "firebase-adminsdk-8kaug@layjoo-line-bot.iam.gserviceaccount.com",
  client_id: clientID,
  auth_uri: "https://accounts.google.com/o/oauth2/auth",
  token_uri: "https://oauth2.googleapis.com/token",
  auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
  client_x509_cert_url:
    "https://www.googleapis.com/robot/v1/metadata/x509/firebase-adminsdk-8kaug%40layjoo-line-bot.iam.gserviceaccount.com",
};

module.exports = serviceAccountKey;
