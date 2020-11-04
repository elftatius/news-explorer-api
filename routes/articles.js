const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');

const { urlRegex } = require('../utils/regex');

const auth = require('../middlewares/auth');
const { createArticle, getArticles, deleteArticle } = require('../controllers/articles');

router.use(auth);

router.post('/', celebrate({
  body: Joi.object().keys({
    keyword: Joi.string().required(),
    title: Joi.string().required(),
    text: Joi.string().required(),
    date: Joi.string().required(),
    source: Joi.string().required(),
    link: Joi.string().regex(urlRegex).required(),
    image: Joi.string().regex(urlRegex).required(),
  }),
}), createArticle);

router.get('/', getArticles);

router.delete('/:id', celebrate({
  params: Joi.object().keys({
    id: Joi.string().length(24).hex(),
  }),
}), deleteArticle);

module.exports = router;
