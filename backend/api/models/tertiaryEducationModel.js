const mongoose = require("mongoose");
const { Schema } = mongoose;

const tertiaryEducationSchema = new Schema({
    userProfile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserProfile",
        required: true,
    },
    schoolName: {
        type: String,
        required: true,
    },
    program: {
        type: String,
        required: true,
    },
    yearStarted: {
        type: String,
        required: true,
    },
    yearEnded: {
        type: String,
        required: true,
    }
}, { timestamps: true });

const TertiaryEducation = mongoose.model("TertiaryEducation", tertiaryEducationSchema);
module.exports = TertiaryEducation;
