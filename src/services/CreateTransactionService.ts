// import AppError from '../errors/AppError';

import { getCustomRepository, getRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import Category from '../models/Category';
import AppError from '../errors/AppError';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction | undefined> {
    const categoriesRepository = getRepository(Category);
    const transactionsRepository = getCustomRepository(TransactionsRepository);

    const balance = await transactionsRepository.getBalance();
    const expectedTotal =
      type === 'income' ? balance.total + value : balance.total - value;

    if (expectedTotal < 0) {
      throw new AppError('Invalid and negative balance');
    }

    let categoryExists = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!categoryExists) {
      categoryExists = await categoriesRepository.save({
        title: category,
      });
    }

    const category_id = categoryExists.id;

    const data = await transactionsRepository.create({
      title,
      value,
      type,
      category_id,
    });

    const { id } = await transactionsRepository.save(data);

    const transaction = await transactionsRepository.findOne(id, {
      relations: ['category'],
    });

    return transaction;
  }
}

export default CreateTransactionService;
