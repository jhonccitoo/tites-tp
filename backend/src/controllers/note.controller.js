const notesCtrl = {};

const Note = require("../models/Note");

notesCtrl.getNotes = async (req, res) => {
  const notes = await Note.find();
  res.json(notes);
};

notesCtrl.createNote = async (req, res) => {
  const { title, content, date, author } = req.body;
  const newNote = new Note({
    title: title,
    content: content,
    date: date,
    author: author,
  });
  await newNote.save();
  res.json({ message: "Note Saved" });
};

notesCtrl.getNote = async (req, res) => {
  const note = await Note.findById(req.params.id);
  res.json(note);
};

notesCtrl.updateNote = async (req, res) => {
  const { title, content, date, author , approvalStatus } = req.body;
  await Note.findByIdAndUpdate(req.params.id, {
    
      title,
      content,
      date,
      author,
      approvalStatus 
    }
  );

  res.json({ message: "Note Updated" });
};

notesCtrl.deleteNote = async (req, res) => {
  await Note.findByIdAndDelete(req.params.id);
  res.json({ message: "Note Deleted" });
};

module.exports = notesCtrl;
