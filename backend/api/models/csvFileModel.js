const mongoose = require("mongoose");
const { Schema } = mongoose;

const csvFileSchema = new Schema(
  {
    fileName: { type: String, required: true },
    filePath: { type: String, required: true },
  },
  { timestamps: true }
);

const CsvFile = mongoose.model("CsvFile", csvFileSchema);
module.exports = CsvFile;
