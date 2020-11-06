class AuthenticationError extends Error {
  constructor(message = 'Ошибка аутентификации.') {
    super(message);
    this.statusCode = 401;
  }
}

module.exports = AuthenticationError;
