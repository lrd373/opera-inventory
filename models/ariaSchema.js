const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const AriaSchema = new Schema({
    name: {type: String, required: true},
    nickname: {type: String},
    opera: {type: Schema.Types.ObjectId, ref: 'Opera', required: true},
    character_name: {type: String},
    act_number: {type: Number},
    scene_number: {type: Number},
    language: {type: String},
    voice_type: {type: String},
    description: {type: String}
    // aria_tags not implemented
});

// Virtual for aria detail url
AriaSchema
.virtual('url')
.get(function(){
    return ('/aria/' + this._id);
});

module.exports = mongoose.model('Aria', AriaSchema);
