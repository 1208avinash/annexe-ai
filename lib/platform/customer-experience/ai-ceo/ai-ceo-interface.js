import AiCeoResponseService from "./ai-ceo-response-service.js";

export default class AiCeoInterface {
  constructor({ responseService = new AiCeoResponseService() } = {}) {
    this.responseService = responseService;
  }

  respond(question, context = {}) {
    return {
      question,
      answer: this.responseService.answer(question, context),
      generatedAt: new Date().toISOString()
    };
  }
}
