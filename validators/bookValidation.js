import Joi from "joi";


const bookValidator = Joi.object({
  bookName: Joi.string().min(1).max(125).required(),
  bookCover: Joi.string().uri().optional(),
  description: Joi.string().max(500).optional(),
  quantityInStock: Joi.number().integer().min(0).required(),
  unitPrice: Joi.number().greater(0).required(),
  publishingDate: Joi.date().iso().required(),
  status: Joi.string().valid('Arrived', 'In Transit').optional()
});

export default bookValidator;
