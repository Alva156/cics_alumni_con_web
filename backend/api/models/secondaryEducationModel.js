const mongoose = require("mongoose");
const { Schema } = mongoose;

const secondaryEducationSchema = new Schema({
    userProfile: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserProfile",
        required: true,
    },
    schoolName: {
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

const SecondaryEducation = mongoose.model("SecondaryEducation", secondaryEducationSchema);
module.exports = SecondaryEducation;
