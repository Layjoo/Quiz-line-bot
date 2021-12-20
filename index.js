require("dotenv").config();
const qaNotionDatabase01 = process.env.QA_DATABASE_01;
const qaNotionDatabase02 = process.env.QA_DATABASE_02;
const qaNotionDatabase03 = process.env.QA_DATABASE_03;
const noteNotionDatabase = process.env.NOTIFY_DATABASE;
const line = require("@line/bot-sdk");
const express = require("express");
const app = express();
const {
  createUser
} = require("./user");
const {
  getQaNotionData,
  getNoteNotionData
} = require("./notion");
const {
  getUser,
  updateUser,
  deleteUser,
  getHasNotify,
  updateNotify,
} = require("./userDatabase");
const {
  questionReply,
  nextQuestionReply,
  message,
  moreMessage
} = require("./lineMessage");

//line setting
const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};
const client = new line.Client(config);


const checkAnswer = (userAnswer, correctAnswer) => {
  if (userAnswer == correctAnswer) {
    return "ตอบถูก👍🏻";
  }
  return `ตอบผิด❌ ข้อที่ถูกคือข้อ ${correctAnswer}`;
};

const checkReplyAnswer = async (event, currentUser) => {
  const isQuestioning = currentUser.status.isQuestioning;
  const hadMore = currentUser.more;
  const reply = event.postback.data;
  //if status is question
  if (isQuestioning) {

    if (reply == "next") {
      const response = sendQuestion(currentUser, event.replyToken, "ข้อต่อไป");
      return response;
    } else if (reply == "exit") {
      await deleteUser(currentUser.userId);
      console.log("เลิกทำข้อสอบแล้ว");
      const response = await client.replyMessage(
        event.replyToken,
        message("เลิกทำข้อสอบแล้ว")
      );
      return response;

    } else if (reply == "more") {
      console.log("ข้อมูลเพิ่มเติม");
      const response = await client.replyMessage(
        event.replyToken,
        moreMessage(hadMore)
      );
      return response;
    } else {
      //send answer 
      const answer = currentUser.currentAnswer;
      const replyAnswer = checkAnswer(reply, answer);
      const response = await client.replyMessage(
        event.replyToken,
        nextQuestionReply(replyAnswer, hadMore)
      );
      return response;
    }
  };
  return Promise.resolve(null);
}

const sendQuestion = async (currentUser, replyToken) => {
  const question = currentUser.currentQuestion;
  const database = currentUser.qaDatabase;
  const data = await getQaNotionData(database);
  const currentIndex = data.findIndex((data) => data.question == question);

  //no data in notion
  if (data.length == 0) {
    await deleteUser(currentUser.userId);
    return client.replyMessage(replyToken, message("ไม่มีข้อสอบในระบบ"));
  }

  //not first time, send next question
  if (question !== false && currentIndex !== data.length - 1) {
    const currentQuestion = data[currentIndex + 1].question;
    const currentAnswer = data[currentIndex + 1].answer;
    const more = data[currentIndex + 1].more;
    const response = await client.replyMessage(
      replyToken,
      questionReply(currentQuestion)
    );
    console.log("Question have send");
    currentUser.currentQuestion = currentQuestion;
    currentUser.currentAnswer = currentAnswer;
    currentUser.more = more;
    await updateUser(currentUser.userId, currentUser);
    console.log(
      `question: ${currentUser.currentQuestion}\nanswer: ${currentUser.currentAnswer}`
    );
    return response;
  }

  //last question in notion database
  if (currentIndex == data.length - 1) {
    const response = await client.replyMessage(
      replyToken,
      message("สิ้นสุดการทำข้อสอบแล้ว")
    );
    await deleteUser(currentUser.userId);
    return response;
  }

  //first time exam
  const currentQuestion = data[0].question;
  const currentAnswer = data[0].answer;
  const more = data[0].more;
  const response = await client.replyMessage(
    replyToken,
    questionReply(currentQuestion)
  );
  console.log("Question have send");
  currentUser.currentQuestion = currentQuestion;
  currentUser.currentAnswer = currentAnswer;
  currentUser.more = more;
  await updateUser(currentUser.userId, currentUser);
  console.log(
    `question: ${currentUser.currentQuestion}\nanswer: ${currentUser.currentAnswer}`
  );
  return response;
};

//web hook, get event when user do somthing with bot
app.post("/callback", line.middleware(config), (req, res) => {
  Promise.all(req.body.events.map(handleEvent))
    .then((result) => res.json(result))
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

//event handler if user interaction with bot
async function handleEvent(event) {
  //check if user is in database or not.
  let currentUser;
  const user = await getUser(event.source.userId);
  currentUser = user || createUser(event.source.userId);

  //check if event is postback message for question.
  if (event.type !== "message" || event.message.type !== "text") {
    return await checkReplyAnswer(event, currentUser);
  } else if (/(?<=ข้อสอบ Comprehensive )\d\d/.test(event.message.text)) {
    const qaType = event.message.text.match(
      /(?<=ข้อสอบ Comprehensive )\d\d/
    )[0];

    switch (
      qaType //choose database depend on user type
    ) {
      case "01":
        currentUser.qaDatabase = qaNotionDatabase01;
        break;
      case "02":
        currentUser.qaDatabase = qaNotionDatabase02;
        break;
      case "03":
        currentUser.qaDatabase = qaNotionDatabase03;
        break;
    }

    //first time exam
    if (!currentUser.status.isQuestioning) {
      currentUser.status.isQuestioning = true;
      await updateUser(currentUser.userId, currentUser);
      console.log("เริ่มทำข้อสอบ");
      const response = sendQuestion(currentUser, event.replyToken);
      return response;
    }

    //if user retyping exam, then reset the exam
    currentUser.currentQuestion = false;
    currentUser.currentAnswer = false;
    const response = sendQuestion(currentUser, event.replyToken);
    return response;
  }

  //if note postback message, send auto text message
  return client.replyMessage(event.replyToken, message(event.message.text));
}

//auto push note 
app.get("/pushNote", async (req, res) => {
  const data = await getNoteNotionData(noteNotionDatabase);
  const getDocument = await getHasNotify();
  let hasNotifyNote = getDocument.hasNotifyNote;
  console.log(hasNotifyNote);

  if (data.length !== 0) {
    for (let i in data) {
      const checkNotify = hasNotifyNote.indexOf(data[i]);
      if (checkNotify == -1) {
        const response = await client.broadcast(message(data[i]));
        console.log("Push notify");
        hasNotifyNote.push(data[i]);
        await updateNotify({
          hasNotifyNote
        });
        res.send(response);
        break;
      }
      if (i == data.length - 1) {
        console.log("Restart notify");
        hasNotifyNote = [];
        const response = await client.broadcast(message(data[0]));
        console.log("Push notify");
        hasNotifyNote.push(data[0]);
        await updateNotify({
          hasNotifyNote
        });
        res.send(response);
      }
    }
  } else {
    hasNotifyNote = [];
    await updateNotify({
      hasNotifyNote
    });
    res.send({
      reply: "No data in database"
    });
    console.log("No note is enable");
  }
});

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});