const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { DateTime } = require('luxon');

const OperaSchema = new Schema({
    name: {type: String, required: true},
    composer: {type: Schema.Types.ObjectId, ref: 'Composer', required: true},
    premiere_date: {type: Date},
    language: {type: String},
    number_of_acts: {type: Number},
    synopsis: {type: String},
    tags: [{type: Schema.Types.ObjectId, ref: 'Tags'}]
});

// Virtual for opera detail url
OperaSchema
.virtual('url')
.get(function(){
    return ('/opera/' + this._id);
});

// Virtual for nicely formatted premiere date
OperaSchema
.virtual('premiere_date_local')
.get(function(){
    if (this.premiere_date) {
        return DateTime.fromJSDate(this.premiere_date).toLocaleString(DateTime.DATE_MED);
    } else {
        return "No premiere date specified";
    }
});

// Virtual for premiere date formatted for form
OperaSchema
.virtual('premiere_date_form')
.get(function(){
    if (this.premiere_date) {
        return DateTime.fromJSDate(this.premiere_date).toFormat('yyyy-MM-dd');
    } else {
        return "No premiere date specified";
    }
});

//Export model
module.exports = mongoose.model('Opera', OperaSchema);