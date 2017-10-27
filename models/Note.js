var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var NoteSchema = new Schema({
  title: {
    type: String
  },
  body: {
    type: String
  }
});

//object ids of these notes are all saved in article model, so this can stay tiny
var Note = mongoose.model("Note", NoteSchema);

module.exports = Note;