import Joi from "joi";

export const bookingSchema = Joi.object({
  service_id: Joi.number().integer().positive().required(),
  date: Joi.date().greater("now").required()
});

export const statusSchema = Joi.object({
  status: Joi.string().valid("pending", "confirmed", "done").required()
});
