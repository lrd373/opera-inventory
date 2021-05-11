const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const { DateTime } = require('luxon');

const ComposerSchema = new Schema({
    first_name: {type: String, required: true},
    last_name: {type: String, require: true},
    birth_date: {type: Date},
    death_date: {type: Date}
});

// Virtual for composer full name
ComposerSchema
.virtual('fullname')
.get(function(){
    return (this.first_name + " " + this.last_name);
});

// Virtual for nicely formatted birth date
ComposerSchema
.virtual('birth_date_local')
.get(function(){
    if (this.birth_date) {
        return DateTime.fromJSDate(this.birth_date).toLocaleString(DateTime.DATE_MED);
    } else {
        return "No date of birth";
    }
});

// Virtual for form birth date format
ComposerSchema
.virtual('birth_date_form')
.get(function() {
    if (this.birth_date) {
        return DateTime.fromJSDate(this.birth_date).toFormat('yyyy-MM-dd');
    } else {
        return "There is no birth date";
    }
});

// Virtual for nicely formatted death date
ComposerSchema
.virtual('death_date_local')
.get(function(){
    if (this.death_date) {
        return DateTime.fromJSDate(this.death_date).toLocaleString(DateTime.DATE_MED);
    } else {
        return "No date of death";
    }
});

// Virtual for form death date format
ComposerSchema
.virtual('death_date_form')
.get(function() {
    if (this.death_date) {
        return DateTime.fromJSDate(this.death_date).toFormat('yyyy-MM-dd');
    } else {
        return "There is no death date";
    }
});

// Composer detail url
ComposerSchema
.virtual('url')
.get(function(){
    return ('/composer/' + this._id);
});

//Export model
module.exports = mongoose.model('Composer', ComposerSchema);