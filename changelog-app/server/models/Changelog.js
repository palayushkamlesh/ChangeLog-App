const mongoose = require("mongoose");

const changelogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    contentMarkdown: {
      type: String,
      required: true,
    },

    category: {
      type: String,
      enum: ["New", "Improved", "Fixed"],
      required: true,
    },

    coverImage: {
      type: String,
      default: "",
    },

    publishedAt: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      enum: ["Draft", "Published"],
      default: "Draft",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Changelog", changelogSchema);