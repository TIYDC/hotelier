module.exports = {
  'db': {
    'name': 'db',
    'connector': 'mongodb',
    'url': process.env.MONGODB_URI || null
  }
};
