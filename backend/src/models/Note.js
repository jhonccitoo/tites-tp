const { Schema, model } = require("mongoose");

const noteSchema = new Schema(
  {
    title: String,
    content: {
      type: String,
      required: true,
    },
    author: String,
    date:{
        type: Date,
        default: Date.now,
    },
    approvalStatus: { type: String, default: '1' }, // Nuevo campo
  },{
    timestamps: true,
  }
);
//Aqui no le agrego notes como el user porque por defecto mongoose le agrega el nombre de la coleccion en plural
module.exports= model("Note", noteSchema);
