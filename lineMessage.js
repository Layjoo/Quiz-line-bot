const questionReply = (displayText) => {
  return {
    type: "text",
    text: displayText,
    quickReply: {
      items: [{
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

const nextQuestionReply = (displayText, hadMore) => {
  const message = {
    type: "text",
    text: displayText,
    quickReply: {
      items: [{
        type: "action",
        action: {
          type: "postback",
          label: "ข้อถัดไป",
          data: "next",
          displayText: "ข้อถัดไป",
        },
      }],
    },
  }
  if (hadMore.length !== 0) {
    message.quickReply.items.push({
      type: "action",
      action: {
        type: "postback",
        label: "ข้อมูลเพิ่มเติม",
        data: "more",
        displayText: "ข้อมูลเพิ่มเติม",
      },
    }, )
  }
  message.quickReply.items.push({
    type: "action",
    action: {
      type: "postback",
      label: "เลิกทำข้อสอบ",
      data: "exit",
      displayText: "เลิกทำข้อสอบ",
    },
  }, )
  return message;
};

const moreMessage = (displayText) => {
  return {
    type: "text",
    text: displayText,
    quickReply: {
      items: [{
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
  }
};

const message = (message) => {
  return {
    type: "text",
    text: message,
  };
};

module.exports = {
  questionReply,
  nextQuestionReply,
  message,
  moreMessage
}