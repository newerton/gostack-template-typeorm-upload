import fs from 'node:fs';
import csv from 'csv-parse/lib/sync';
import { getCustomRepository } from 'typeorm';
import configUpload from '../config/upload';
import Transaction from '../models/Transaction';
import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from './CreateTransactionService';

interface Request {
  filename: string;
}

interface CSVAttributes {
  title: string;
  value: string;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute({ filename }: Request): Promise<Transaction[]> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const createTransaction = new CreateTransactionService();

    const fileName = fs
      .readFileSync(`${configUpload.directory}/${filename}`, 'utf8')
      .toString();

    const records = await csv(fileName, { delimiter: ', ', columns: true });

    for (const item of records) {
      const _transaction = await createTransaction.execute({
        title: item.title,
        value: parseFloat(item.value),
        type: item.type,
        category: item.category,
      });
    }

    const transactions = await transactionsRepository.find({
      relations: ['category'],
    });

    return transactions;
  }
}

export default ImportTransactionsService;
