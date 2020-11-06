const Article = require('../models/article');
const NotFoundError = require('../errors/not-found-err');
const ValidationError = require('../errors/validation-err');
const AuthorizationError = require('../errors/authorization-err');

module.exports.createArticle = (req, res, next) => {
  Article.create({ ...req.body, owner: req.user._id })
    .then((article) => res.send({ data: article }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        throw new ValidationError();
      }
    })
    .catch(next);
};

module.exports.getArticles = (req, res, next) => {
  Article.find({})
    .then((articles) => res.send({ data: articles }))
    .catch(next);
};

module.exports.deleteArticle = (req, res, next) => {
  Article.findById(req.params.id).select('+owner')
    .then((article) => {
      if (!article) {
        throw new NotFoundError('Такая статья не найдена.');
      } else if (article.owner.toString() !== req.user._id) {
        throw new AuthorizationError();
      }
      Article.deleteOne(article)
        .then((articleToDelete) => {
          res.send({ data: articleToDelete });
        });
    })
    .catch(next);
};
