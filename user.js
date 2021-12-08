const createUser = (userId) => {
  return {
    userId: userId,
    status: {
      isQuestioning: false,
    },
    currentQuestion: false,
    currentAnswer: false,
    qaDatabase: false,
  }
}

module.exports = {createUser};
