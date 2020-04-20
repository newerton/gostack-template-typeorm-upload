import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const incomes = await this.find({
      where: { type: 'income' },
    });

    const income = await incomes.reduce(
      (total, transaction) =>
        (transaction.type === 'income' && total + transaction.value) || total,
      0,
    );

    const outcomes = await this.find({
      where: { type: 'outcome' },
    });

    const outcome = await outcomes.reduce(
      (total, transaction) =>
        (transaction.type === 'outcome' && total + transaction.value) || total,
      0,
    );

    const total = income - outcome || 0;

    return { income, outcome, total };
  }
}

export default TransactionsRepository;
