require("dotenv").config();
const line = require("@line/bot-sdk");
const express = require("express");
const qaNotionDatabase01 = process.env.QA_DATABASE_01;
const qaNotionDatabase02 = process.env.QA_DATABASE_02;
const qaNotionDatabase03 = process.env.QA_DATABASE_03;
const noteNotionDatabase = process.env.NOTIFY_DATABASE;
const app = express();
const { createUser } = require("./user");
const { getQaNotionData, getNoteNotionData } = require("./notion");
const { getUser, updateUser, deleteUser, getHasNotify, updateNotify } = require("./userDatabase");

const config = {
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
  channelSecret: process.env.CHANNEL_SECRET,
};
const client = new line.Client(config);

const questionReply = (displayText) => {
  return {
    type: "text",
    text: displayText,
    quickReply: {
      items: [
        {
          type: "action",
          action: {
            type: "postback",
            label: "ข้อ 1",
            data: "1",
            displayText: "ข้อ 1",
          },
        },
        {
          type: "action",
          action: {
            type: "postback",
            label: "ข้อ 2",
            data: "2",
            displayText: "ข้อ 2",
          },
        },
        {
          type: "action",
          action: {
            type: "postback",
            label: "ข้อ 3",
            data: "3",
            displayText: "ข้อ 3",
          },
        },
        {
          type: "action",
          action: {
            type: "postback",
            label: "ข้อ 4",
            data: "4",
            displayText: "ข้อ 4",
          },
        },
        {
          type: "action",
          action: {
            type: "postback",
            label: "ข้อ 5",
            data: "5",
            displayText: "ข้อ 5",
          },
        },
        {
          type: "action",
          action: {
            type: "postback",
            label: "เลิกทำข้อสอบ",
            data: "exit",
            displayText: "เลิกทำข้อสอบ",
          },
        },
      ],
    },
  };
};

const nextQuestionReply = (displayText) => {
  return {
    type: "text",
    text: displayText,
    quickReply: {
      items: [
        {
          type: "action",
          action: {
            type: "postback",
            label: "ข้อถัดไป",
            data: "next",
            displayText: "ข้อถัดไป",
          },
        },
        {
          type: "action",
          action: {
            type: "postback",
            label: "เลิกทำข้อสอบ",
            data: "exit",
            displayText: "เลิกทำข้อสอบ",
          },
        },
      ],
    },
  };
};

const lastQuestionReply = (displayText) => {
  return {
    type: "text",
    text: displayText,
    quickReply: {
      items: [
        {
          type: "action",
          action: {
            type: "postback",
            label: "เลิกทำข้อสอบ",
            data: "exit",
            displayText: "เลิกทำข้อสอบ",
          },
        },
        {
          type: "action",
          action: {
            type: "postback",
            label: "ทำข้อสอบอีกครั้ง",
            data: "retry",
            displayText: "ทำข้อสอบอีกครั้ง",
          },
        },
      ],
    },
  };
};

const checkAnswer = (userAnswer, correctAnswer) => {
  if (userAnswer == correctAnswer) {
    return "ตอบถูก👍🏻";
  }
  return "ตอบผิด❌";
};

const message = (message) => {
  return {
    type: "text",
    text: message,
  };
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

const checkReplyAnswer = async (event, currentUser) => {
  const isQuestioning = currentUser.status.isQuestioning;
  //if status is question
  if (isQuestioning) {
    if (
      //for any answer 1-5
      event.postback.data !== "exit" &&
      event.postback.data !== "next" &&
      event.postback.data !== "retry"
    ) {
      const answer = currentUser.currentAnswer;
      const replyAnswer = checkAnswer(event.postback.data, answer);
      const response = await client.replyMessage(
        event.replyToken,
        nextQuestionReply(replyAnswer)
      );
      return response;
    } else if (event.postback.data == "next") {
      const response = sendQuestion(currentUser, event.replyToken, "ข้อต่อไป");
      return response;
    } else if (event.postback.data == "retry") {
      console.log("เริ่มทำข้อสอบใหม่");
      const response = sendQuestion(currentUser, event.replyToken);
      return response;
    }

    await deleteUser(currentUser.userId);
    console.log("เลิกทำข้อสอบแล้ว");
    const response = await client.replyMessage(
      event.replyToken,
      message("เลิกทำข้อสอบแล้ว")
    );
    return response;
  } else {
    return Promise.resolve(null);
  }
};

// event handler if user interaction with bot
async function handleEvent(event) {
  console.log(event);

  //check if user is in database or not.
  let currentUser;
  const user = await getUser(event.source.userId);
  currentUser = user || createUser(event.source.userId);
  console.log(currentUser);

  //check if event is postback message for question.
  if (event.type !== "message" || event.message.type !== "text") {
    return await checkReplyAnswer(event, currentUser);
  } else if (/(?<=ข้อสอบ Comprehensive )\d\d/.test(event.message.text)) {
    const qaType = event.message.text.match(
      /(?<=ข้อสอบ Comprehensive )\d\d/
    )[0];

    switch (qaType) {
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

    if (!currentUser.status.isQuestioning) {
      currentUser.status.isQuestioning = true;
      await updateUser(currentUser.userId, currentUser);
      console.log("เริ่มทำข้อสอบ");
      const response = sendQuestion(currentUser, event.replyToken);
      return response;
    }

    //if re-type -> retry exam agian
    currentUser.currentQuestion = false;
    currentUser.currentAnswer = false;
    const response = sendQuestion(currentUser, event.replyToken);
    return response;
  }

  //auto text message
  return client.replyMessage(event.replyToken, message(event.message.text));
}

const sendQuestion = async (currentUser, replyToken) => {
  const question = currentUser.currentQuestion;
  const database = currentUser.qaDatabase;
  const data = await getQaNotionData(database);
  const currentIndex = data.findIndex((data) => data.question == question);

  if (data.length == 0) {
    await deleteUser(currentUser.userId);
    return client.replyMessage(replyToken, message("ไม่มีข้อสอบในระบบ"));
  }

  if (question !== false && currentIndex !== data.length - 1) {
    const currentQuestion = data[currentIndex + 1].question;
    const currentAnswer = data[currentIndex + 1].answer;
    const response = await client.replyMessage(
      replyToken,
      questionReply(currentQuestion)
    );
    console.log("Question have send");
    currentUser.currentQuestion = currentQuestion;
    currentUser.currentAnswer = currentAnswer;
    await updateUser(currentUser.userId, currentUser);
    console.log(
      `question: ${currentUser.currentQuestion}\nanswer: ${currentUser.currentAnswer}`
    );
    return response;
  }

  if (currentIndex == data.length - 1) {
    const response = await client.replyMessage(
      replyToken,
      lastQuestionReply("สิ้นสุดการทำข้อสอบแล้ว")
    );
    currentUser.currentQuestion = false;
    currentUser.currentAnswer = false;
    await updateUser(currentUser.userId, currentUser);
    return response;
  }

  //firt time after type "ข้อสอบ"
  const currentQuestion = data[0].question;
  const currentAnswer = data[0].answer;
  const response = await client.replyMessage(
    replyToken,
    questionReply(currentQuestion)
  );
  console.log("Question have send");
  currentUser.currentQuestion = currentQuestion;
  currentUser.currentAnswer = currentAnswer;
  await updateUser(currentUser.userId, currentUser);
  console.log(
    `question: ${currentUser.currentQuestion}\nanswer: ${currentUser.currentAnswer}`
  );
  return response;
};

app.get("/pushNote", async (req, res) => {
  const data = await getNoteNotionData(noteNotionDatabase);
  const getDocument = await getHasNotify();
  let hasNotifyNote = getDocument.hasNotifyNote;
  console.log(hasNotifyNote)

  if (data.length !== 0) {
    for (let i in data) {
      const checkNotify = hasNotifyNote.indexOf(data[i]);
      if (checkNotify == -1) {
        const response = await client.broadcast(message(data[i]));
        console.log("Push notify");
        hasNotifyNote.push(data[i]);
        await updateNotify({hasNotifyNote});
        res.send(response);
        break;
      }
      if (i == data.length - 1) {
        console.log("Restart notify");
        hasNotifyNote = [];
        const response = await client.broadcast(message(data[0]));
        console.log("Push notify");
        hasNotifyNote.push(data[0]);
        await updateNotify({hasNotifyNote});
        res.send(response);
      }
    }
  } else {
    hasNotifyNote = [];
    await updateNotify({hasNotifyNote});
    res.send({ reply: "No data in database" });
    console.log("No note is enable");
  }
});

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
