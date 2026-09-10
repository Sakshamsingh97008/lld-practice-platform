import { JsonRepository } from "./jsonRepository.js";

export class ProblemRepository extends JsonRepository {
  async findAll() {
    return this.read();
  }

  async findById(id) {
    return (await this.read()).find((problem) => problem.id === id) || null;
  }
}
