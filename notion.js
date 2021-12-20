require("dotenv").config();
const axios = require("axios");
const notionToken = process.env.NOTION_TOKEN;

//notion config
const notionConfig = (database) => {
  return {
    method: "post",
    url: `https://api.notion.com/v1/databases/${database}/query`,
    headers: {
      Authorization: `Bearer ${notionToken}`,
      "Notion-Version": "2021-08-16",
      "Content-type": "application/json",
    },
    data: JSON.stringify({
      filter: {
        property: "Notify",
        select: {
          equals: "enable",
        },
      },
    }),
  };
};

//get notion question and answer
const getQaNotionData = async (database) => {
  const response = await axios(notionConfig(database));
  const results = response.data.results;
  const data = [];
  for (let i in results) {
    data.push({
      question: results[i].properties.question.rich_text[0].plain_text,
      answer: results[i].properties.answer.rich_text[0].plain_text,
      more: results[i].properties.more.rich_text[0] ? results[i].properties.more.rich_text[0].plain_text : []
    });
  }
  return data;
};

//get notion notify note
const getNoteNotionData = async (database) => {
  const response = await axios(notionConfig(database));
  const results = response.data.results;
  const title = [];
  for (let i in results) {
    title.push(results[i].properties.note.rich_text[0].plain_text);
  }
  return title;
};

module.exports = { getNoteNotionData, getQaNotionData };
