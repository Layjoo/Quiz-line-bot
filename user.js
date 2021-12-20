const createUser = (userId) => {
  return {
    userId: userId,
    status: {
      isQuestioning: false,
    },
    currentQuestion: false,
    currentAnswer: false,
    qaDatabase: false,
    more: false
  }
}

module.exports = {createUser};
