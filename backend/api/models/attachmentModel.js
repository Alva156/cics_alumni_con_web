const mongoose = require("mongoose");
const { Schema } = mongoose;

const attachmentSchema = new Schema({
    userProfile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserProfile",
        required: true,
    },
    id: {
        type: Number,
    },
    filePath: {
        type: String, // URL or path to the attachment file
    }
}, { timestamps: true });

const Attachment = mongoose.model("Attachment", attachmentSchema);
module.exports = Attachment;
