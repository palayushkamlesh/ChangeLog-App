const mongoose = require("mongoose");

const reactionSchema = new mongoose.Schema(
  {
    changelogId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Changelog",
      required: true,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    type: {
      type: String,
      enum: ["heart", "party", "rocket"],
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// One user can have only one reaction of each type
reactionSchema.index(
  {
    changelogId: 1,
    userId: 1,
    type: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("Reaction", reactionSchema);