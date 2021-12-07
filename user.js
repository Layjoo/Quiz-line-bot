class User {
  #status;
  #userId;
  #currentQuestion;
  #currentAnswer;
  #qaDatabase;
  constructor(userId) {
    this.#userId = userId;
    this.#status = {
      isQuestioning: false,
    };
    this.#currentQuestion = false;
    this.#currentAnswer = false;
    this.#qaDatabase = false;
  }

  isQuestioning(status) {
    this.#status.isQuestioning = status;
  }

  setCurrentQuestion(currentQuestion) {
    this.#currentQuestion = currentQuestion;
  }

  setCurrentAnswer(currentAnswer) {
    this.#currentAnswer = currentAnswer;
  }

  setQaDatabase(database) {
    this.#qaDatabase = database;
  }

  getUser() {
    return {
      userId: this.#userId,
      status: this.#status,
      currentQuestion: this.#currentQuestion,
      currentAnswer: this.#currentAnswer,
      qaDatabase: this.#qaDatabase,
    };
  }
}

module.exports = { User };
