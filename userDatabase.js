const {
  initializeApp,
  applicationDefault,
  cert,
} = require("firebase-admin/app");
const {
  getFirestore,
  Timestamp,
  FieldValue,
} = require("firebase-admin/firestore");
const serviceAccountKey = require("./serviceAccountKey");
const User = require("./user");

initializeApp({
  credential: cert(serviceAccountKey),
});

const db = getFirestore();

const deleteUser = async (userId) => {
  const res = await db.collection("user").doc(userId).delete();
  console.log("Delete User complete");
  return res;
};

const updateUser = async (userId, data = {}) => {
  const userRef = db.collection("user").doc(userId);
  const res = await userRef.set(data, { merge: false });
  console.log("Update user database");
  return res;
};

const getUser = async (userId) => {
  const userRef = db.collection("user").doc(userId);
  const doc = await userRef.get();
  if (!doc.exists) {
    console.log("No such document!");
    return null;
  } else {
    console.log("Get data from clound");
    return doc.data();
  }
};

const updateNotify = async (data = []) => {
  const userRef = db.collection("notify").doc("hasNotify");
  const res = await userRef.set(data, { merge: false });
  console.log("Update user database");
  return res;
};

const getHasNotify =async () => {
  const notifyRef = db.collection("notify").doc("hasNotify");
  const doc = await notifyRef.get();
  if (!doc.exists) {
    console.log("No such document!");
    return null;
  } else {
    console.log("Get data from clound");
    return doc.data();
  }
};

module.exports = { getUser, deleteUser, updateUser, updateNotify, getHasNotify };
