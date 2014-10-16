/**
 * Log error message and respond with status code 500
 * having error message in the response body.
 *
 * @param {Object} err: the error object
 * @param {Object} req: request object
 * @param {Object} res: response object
 * @param {Object} next: next callback
 */
function error(err, req, res, next) {
  console.error('An unexpected error occurred %s', err.message);
  res.status(500).send(err.message);
}

exports.error = error;