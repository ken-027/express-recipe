const mongoose = require('mongoose');
const Schema = mongoose.Schema;



const leaderSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        type: String,
        required: true
    },
    designation: {
        type: String,
        required: true
    },
    abbr: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    }
}, {
    timestamp: true
});

var Promotions = mongoose.model('Leader', leaderSchema);

module.exports = Promotions;