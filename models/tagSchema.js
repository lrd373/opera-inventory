const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TagSchema = new Schema({
    name: {type: String, required: true},
    description: {type: String}
});

// Virtual for tag detail url
TagSchema
.virtual('url')
.get(function(){
    return ('/tag/' + this._id);
});

module.exports = mongoose.model('Tag', TagSchema);