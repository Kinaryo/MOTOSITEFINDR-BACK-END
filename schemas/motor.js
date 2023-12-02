const Joi = require('joi');

module.exports.motorSchema = Joi.object({
    motor: Joi.object({
        title: Joi.string().required(),
        licensePlate: Joi.string().required(),
        model: Joi.string().required(),
        description: Joi.string().required(),
        dateTime: Joi.string().required(),
        image: Joi.string().required(),
    }).required(),
});
