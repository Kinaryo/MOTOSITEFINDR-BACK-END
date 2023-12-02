const Joi = require('joi')

module.exports.commentSchema = Joi.object({
    comment:Joi.object({
        body: Joi.string().required(),
        dateTime: Joi.string(),
    }).required()
})
