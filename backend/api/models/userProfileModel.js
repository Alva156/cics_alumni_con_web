const mongoose = require("mongoose");
const { Schema } = mongoose;

const userProfileSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId, // Referencing the User model
        ref: "User",
        required: true,
    },
    firstName: {
        type: String,
        required: true,
    },
    lastName: {
        type: String,
        required: true,
    },
    birthday: {
        type: Date,
        required: true,
    },
    accountEmail: {
        type: String,
    },
    profession: {
        type: String,
    },
    collegeProgram: {
        type: String,
    },
    specialization: {
        type: String,
    },
    yearStartedCollege: {
        type: String,
    },
    yearGraduatedCollege: {
        type: String,
    },
    timeToJob: {
        type: String,
    },
    employmentStatus: {
        type: String,
    },
    workIndustry: {
        type: String,
    },
    professionAlignment: {
        type: String,
    },
    maritalStatus: {
        type: String,
    },
    salaryRange: {
        type: String,
    },
    placeOfEmployment: {
        type: String,
    },
    profileImage: {
        type: String, // Storing as base64 string or URL
    },
    attachments: [
        {
            id: {
                type: Number,
            },
            fileName: {
                type: String, // The original file name
                required: true,
            },
            filePath: {
                type: String, // The path where the file is stored
                required: true,
            },
        },
    ],
    secondaryEducation: [
        {
            schoolName: String,
            yearStarted: String,
            yearEnded: String,
        },
    ],
    tertiaryEducation: [
        {
            schoolName: String,
            program: String,
            yearStarted: String,
            yearEnded: String,
        },
    ],
    careerBackground: [
        {
            companyName: String,
            position: String,
            yearStarted: String,
            yearEnded: String,
        },
    ],
    contactInformation: {
        linkedIn: String,
        facebook: String,
        instagram: String,
        email: {
            type: String,
        },
        mobileNumber: {
            type: String,
        },
        other: String,
    },
}, { timestamps: true });

const UserProfile = mongoose.model("UserProfile", userProfileSchema);

module.exports = UserProfile;
