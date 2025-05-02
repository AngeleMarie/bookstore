import Joi from "joi";

const userValidation =Joi.object({
    lastName:Joi.string().min(3).max(120).required(),
    firstName:Joi.string().min(3).max(120).required(),
    email:Joi.string().email().required(),
    phoneNumber: Joi.string().min(10).max(15).pattern(/^[0-9]+$/).required(),
    role: Joi.string().valid("admin", "client").default("client"),
    address: Joi.string().max(500).optional(),
    profileImage: Joi.string().uri().optional(),
    password:Joi.string().required().min(8).pattern(
        new RegExp(
          '^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$'
        )
      )
      .messages({
        'string.pattern.base':
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character (!@#$%^&*).',
        'string.min': 'Password must be at least 8 characters long.',
      }),
      role: Joi.string().valid("admin", "client").default("client")
    
  });
export default userValidation;