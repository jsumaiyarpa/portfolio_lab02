const mongoose = require("mongoose");
const crypto = require("crypto");

function generatePublicId() {
  return crypto.randomBytes(6).toString("base64url");
}

const portfolioSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },

    headline: {
      type: String,
      required: true,
    },

    tagline: {
      type: String,
      required: true,
    },

    about: {
      type: String,
      required: true,
    },

    email: {
      type: String,
      required: true,
    },

    contact: {
      type: String,
      required: true,
    },

    profilePic: {
      type: String,
      default: "",
    },

    softSkills: {
      type: String,
      required: true,
    },

    techSkills: {
      type: String,
      required: true,
    },

    education: [
      {
        institution: String,
        degree: String,
      },
    ],

    experience: [
      {
        company: String,
        duration: String,
        responsibilities: String,
      },
    ],

    projects: {
      type: String,
      default: "",
    },

    template: {
      type: String,
      default: "corporate",
    },

    publicId: {
      type: String,
      unique: true,
      sparse: true,
      default: generatePublicId,
    },

    isPublic: {
      type: Boolean,
      default: false,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },

  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Portfolio", portfolioSchema);