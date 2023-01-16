module.exports = {
    'secretKey': process.env.SECRETKEY || '12345',
    'mongoUrl': process.env.MONGOURL || 'mongodb://localhost:27017/app',
    'facebook': {
        clientId: process.env.FACEBOOKCLIENTID || 'clientid',
        clientSecret: process.env.FACEBOOKCLIENTSECRET || 'clientsecret'
    }
}
