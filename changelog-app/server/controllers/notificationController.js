const Notification = require("../models/Notification");
const User = require("../models/User");
const Changelog = require("../models/Changelog");

// Get all notifications
const getNotifications = async (req, res) => {
  try {
    const notifications = await Notification.find({
      userId: req.user.id,
    })
      .populate("changelogId", "title slug publishedAt")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch notifications",
    });
  }
};

// Get unread notification count
const getUnreadCount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);

    if (!user) {
      return res.status(404).json({
        message: "User not found",
      });
    }

    // If user has never viewed the changelog,
    // count all published changelogs as unread.
    const lastViewedDate = user.lastViewedChangelogDate;

    const query = {
      status: "Published",
    };

    if (lastViewedDate) {
      query.publishedAt = {
        $gt: lastViewedDate,
      };
    }

    const unreadCount = await Changelog.countDocuments(query);

    res.json({
      count: unreadCount,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch unread count",
    });
  }
};

// Mark one notification as read
const markAsRead = async (req, res) => {
  try {
    await Notification.findOneAndUpdate(
      {
        _id: req.params.id,
        userId: req.user.id,
      },
      {
        read: true,
      }
    );

    res.json({
      message: "Notification marked as read",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to mark notification as read",
    });
  }
};

// Mark all notifications as read
const markAllAsRead = async (req, res) => {
  try {
    await Notification.updateMany(
      {
        userId: req.user.id,
        read: false,
      },
      {
        read: true,
      }
    );

    // Update changelog last viewed timestamp
    await User.findByIdAndUpdate(req.user.id, {
      lastViewedChangelogDate: new Date(),
    });

    res.json({
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to mark notifications as read",
    });
  }
};

module.exports = {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
};