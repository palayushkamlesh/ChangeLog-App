const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");

const User = require("./models/User");

dotenv.config();

const createAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = "admin@changelog.com";
    const password = "Admin@123";

    const existing = await User.findOne({ email });

    if (existing) {
      existing.role = "admin";
      existing.emailVerified = true;

      await existing.save();

      console.log("Existing user converted to admin");
    } else {
      const hashedPassword = await bcrypt.hash(
        password,
        10
      );

      await User.create({
        name: "Admin",
        email,
        password: hashedPassword,
        role: "admin",
        emailVerified: true,
      });

      console.log("Admin created successfully");
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

createAdmin();