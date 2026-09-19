const Changelog = require("../models/Changelog");
const Reaction = require("../models/Reaction");
const Notification = require("../models/Notification");
const User = require("../models/User");

// =====================================
// CREATE SLUG
// =====================================

const createSlug = (title) => {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
};


// =====================================
// CREATE CHANGELOG
// =====================================

exports.createChangelog = async (req, res) => {
  try {
    const {
      title,
      contentMarkdown,
      category,
      coverImage,
      status,
    } = req.body;

    if (!title || !contentMarkdown || !category) {
      return res.status(400).json({
        message: "Title, content and category are required",
      });
    }

    let slug = createSlug(title);

    // Check for duplicate slug
    const existing = await Changelog.findOne({ slug });

    if (existing) {
      slug = `${slug}-${Date.now()}`;
    }

    const changelog = await Changelog.create({
      title,
      slug,
      contentMarkdown,
      category,
      coverImage: coverImage || "",
      status: status || "Draft",
      publishedAt:
        status === "Published"
          ? new Date()
          : null,
      createdBy: req.user.id,
    });

    // If created directly as Published,
    // notify all users except the admin
    if (status === "Published") {
      const users = await User.find({
        _id: { $ne: req.user.id },
      }).select("_id");

      if (users.length > 0) {
        const notifications = users.map((user) => ({
          userId: user._id,
          changelogId: changelog._id,
          title: "New Product Update",
          message: changelog.title,
          read: false,
        }));

        await Notification.insertMany(notifications);
      }
    }

    res.status(201).json({
      message: "Changelog created successfully",
      changelog,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to create changelog",
    });
  }
};


// =====================================
// GET ALL ADMIN CHANGELOGS
// =====================================

exports.getAdminChangelogs = async (req, res) => {
  try {
    const changelogs = await Changelog.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "name email");

    res.json(changelogs);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch changelogs",
    });
  }
};


// =====================================
// UPDATE CHANGELOG
// =====================================

exports.updateChangelog = async (req, res) => {
  try {
    const { id } = req.params;

    const changelog = await Changelog.findById(id);

    if (!changelog) {
      return res.status(404).json({
        message: "Changelog not found",
      });
    }

    const {
      title,
      contentMarkdown,
      category,
      coverImage,
      status,
    } = req.body;

    if (title) {
      changelog.title = title;
    }

    if (contentMarkdown !== undefined) {
      changelog.contentMarkdown = contentMarkdown;
    }

    if (category) {
      changelog.category = category;
    }

    if (coverImage !== undefined) {
      changelog.coverImage = coverImage;
    }

    if (status) {
      changelog.status = status;

      if (
        status === "Published" &&
        !changelog.publishedAt
      ) {
        changelog.publishedAt = new Date();
      }

      if (status === "Draft") {
        changelog.publishedAt = null;
      }
    }

    await changelog.save();

    res.json({
      message: "Changelog updated successfully",
      changelog,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update changelog",
    });
  }
};


// =====================================
// DELETE CHANGELOG
// =====================================

exports.deleteChangelog = async (req, res) => {
  try {
    const { id } = req.params;

    const changelog = await Changelog.findByIdAndDelete(id);

    if (!changelog) {
      return res.status(404).json({
        message: "Changelog not found",
      });
    }

    // Delete reactions
    await Reaction.deleteMany({
      changelogId: id,
    });

    // Delete notifications
    await Notification.deleteMany({
      changelogId: id,
    });

    res.json({
      message: "Changelog deleted successfully",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to delete changelog",
    });
  }
};


// =====================================
// PUBLISH CHANGELOG
// =====================================

exports.publishChangelog = async (req, res) => {
  try {
    const changelog = await Changelog.findById(
      req.params.id
    );

    if (!changelog) {
      return res.status(404).json({
        message: "Changelog not found",
      });
    }

    // Prevent duplicate notification
    const wasAlreadyPublished =
      changelog.status === "Published";

    changelog.status = "Published";
    changelog.publishedAt = new Date();

    await changelog.save();

    // Only create notifications the first time
    if (!wasAlreadyPublished) {
      const users = await User.find({
        _id: { $ne: req.user.id },
      }).select("_id");

      if (users.length > 0) {
        const notifications = users.map((user) => ({
          userId: user._id,
          changelogId: changelog._id,
          title: "New Product Update",
          message: changelog.title,
          read: false,
        }));

        await Notification.insertMany(notifications);
      }
    }

    res.json({
      message: "Changelog published",
      changelog,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to publish changelog",
    });
  }
};


// =====================================
// PUBLIC CHANGELOGS
// =====================================

exports.getPublicChangelogs = async (req, res) => {
  try {
    const {
      category,
      search,
    } = req.query;

    const filter = {
      status: "Published",
    };

    // Category filter
    if (
      category &&
      category !== "All"
    ) {
      filter.category = category;
    }

    // Search filter
    if (search) {
      filter.$or = [
        {
          title: {
            $regex: search,
            $options: "i",
          },
        },
        {
          contentMarkdown: {
            $regex: search,
            $options: "i",
          },
        },
      ];
    }

    const changelogs = await Changelog.find(filter)
      .sort({ publishedAt: -1 });

    const results = await Promise.all(
      changelogs.map(async (item) => {
        const reactions =
          await Reaction.aggregate([
            {
              $match: {
                changelogId: item._id,
              },
            },
            {
              $group: {
                _id: "$type",
                count: {
                  $sum: 1,
                },
              },
            },
          ]);

        return {
          ...item.toObject(),
          reactions,
        };
      })
    );

    res.json(results);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message:
        "Failed to fetch public changelogs",
    });
  }
};


// =====================================
// SINGLE CHANGELOG
// =====================================

exports.getChangelogBySlug = async (
  req,
  res
) => {
  try {
    const changelog =
      await Changelog.findOne({
        slug: req.params.slug,
        status: "Published",
      });

    if (!changelog) {
      return res.status(404).json({
        message: "Changelog not found",
      });
    }

    res.json(changelog);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch changelog",
    });
  }
};


// =====================================
// REACTION
// =====================================

exports.reactToChangelog = async (
  req,
  res
) => {
  try {
    const { type } = req.body;
    const { id } = req.params;

    if (
      ![
        "heart",
        "party",
        "rocket",
      ].includes(type)
    ) {
      return res.status(400).json({
        message: "Invalid reaction",
      });
    }

    const existing =
      await Reaction.findOne({
        changelogId: id,
        userId: req.user.id,
        type,
      });

    // Remove reaction if it already exists
    if (existing) {
      await Reaction.findByIdAndDelete(
        existing._id
      );

      return res.json({
        message: "Reaction removed",
      });
    }

    // Add reaction
    await Reaction.create({
      changelogId: id,
      userId: req.user.id,
      type,
    });

    res.json({
      message: "Reaction added",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to update reaction",
    });
  }
};


// =====================================
// JSON FEED
// =====================================

exports.getFeed = async (req, res) => {
  try {
    const changelogs =
      await Changelog.find({
        status: "Published",
      })
        .sort({ publishedAt: -1 })
        .select(
          "title slug contentMarkdown category coverImage publishedAt"
        );

    res.json({
      success: true,
      count: changelogs.length,
      data: changelogs,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to generate feed",
    });
  }
};