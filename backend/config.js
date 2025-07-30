module.exports = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: process.env.PORT || 5001,
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb+srv://vtwizere:U4MzDRudwqbATncy@cluster0.rqkr9tc.mongodb.net/refuture?retryWrites=true&w=majority&appName=Cluster0',
  JWT_SECRET: process.env.JWT_SECRET || '0ce5737a3f65992b010861bb94b4674cdfe4ecf7c21704b85009f48b83462c566a5464e098623d5ceaa3b3f7eeeebc4a034849ef27d6d42f84877770471f5f8a',
  JWT_EXPIRE: process.env.JWT_EXPIRE || '30d'
}; 