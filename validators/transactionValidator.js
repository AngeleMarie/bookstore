
import Joi from 'joi';

const transactionSchema = Joi.object({
  bookId: Joi.number().integer().positive().required(),
  userId: Joi.number().integer().positive().required(),
  adminId: Joi.number().integer().positive().required(),
  amount: Joi.number().positive().required(),
});

export const validateTransaction = (data) => {
  return transactionSchema.validate(data);
};
