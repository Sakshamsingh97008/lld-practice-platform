import { JsonRepository } from "./jsonRepository.js";

export class AttemptRepository extends JsonRepository {
  async findAll() {
    return (await this.read()).sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
  }

  async findById(id) {
    return (await this.read()).find((attempt) => attempt.id === id) || null;
  }

  async save(attempt) {
    const all = await this.read();
    const index = all.findIndex((item) => item.id === attempt.id);
    if (index === -1) all.push(attempt);
    else all[index] = attempt;
    await this.write(all);
    return attempt;
  }
}
