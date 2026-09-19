const express = require("express");

const changelogController = require("../controllers/changelogController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

const {
  createChangelog,
  getAdminChangelogs,
  updateChangelog,
  deleteChangelog,
  publishChangelog,
  getPublicChangelogs,
  getChangelogBySlug,
  getFeed,
} = changelogController;

const {
  protect,
  adminOnly,
} = authMiddleware;


// ADMIN

router.get(
  "/admin/all",
  protect,
  adminOnly,
  getAdminChangelogs
);

router.post(
  "/admin",
  protect,
  adminOnly,
  createChangelog
);

router.put(
  "/admin/:id",
  protect,
  adminOnly,
  updateChangelog
);

router.delete(
  "/admin/:id",
  protect,
  adminOnly,
  deleteChangelog
);

router.patch(
  "/admin/:id/publish",
  protect,
  adminOnly,
  publishChangelog
);


// PUBLIC

router.get(
  "/feed",
  getFeed
);

router.get(
  "/",
  getPublicChangelogs
);

router.get(
  "/:slug",
  getChangelogBySlug
);


// Reaction route intentionally removed for now


module.exports = router;