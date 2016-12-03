module.exports = {
  'db': {
    'name': 'db',
    'connector': 'mongodb',
    'host': process.env.DB_HOST || null,
    'port': process.env.DB_PORT || 27017,
    'database': process.env.DB_NAME || null,
    'username': process.env.DB_USER || 'admin',
    'password': process.env.DB_PASS || '*****'
  }
};
