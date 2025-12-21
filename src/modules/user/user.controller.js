import userModel from "../../../DB/models/user.model.js";
import cloudinary from "../../utils/cloudinary.js";

export const create = async (req, res) => {
  try {
    const { userName, email, password, phone, address, gender, role } =
      req.body;

    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already exists" });
    }

    let image = null;
    if (req.files?.image?.length) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.files.image[0].path,
        { folder: `${process.env.APP_NAME}/users/${userName}` }
      );
      image = { secure_url, public_id };
    }

    const user = await userModel.create({
      userName,
      email,
      password,
      phone,
      address,
      gender,
      role,
      image,
    });

    return res.status(201).json({ message: "success", user });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const get = async (req, res) => {
  try {
    const users = await userModel
      .find({})
      .select(
        "userName email phone address gender role status image createdAt updatedAt"
      );
    return res.status(200).json({ message: "success", users });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel
      .findById(id)
      .select(
        "userName email phone address gender role status image createdAt updatedAt"
      );
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "success", user });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const update = async (req, res) => {
  try {
    const { id } = req.params;
    const { userName, phone, address, gender, role, status } = req.body;

    const updateData = { userName, phone, address, gender, role, status };

    if (req.files?.image?.length) {
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.files.image[0].path,
        { folder: `${process.env.APP_NAME}/users/${userName || "user"}` }
      );
      updateData.image = { secure_url, public_id };
    }

    const updatedUser = await userModel.findByIdAndUpdate(id, updateData, {
      new: true,
    });

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({ message: "success", user: updatedUser });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const remove = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await userModel.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.image?.public_id) {
      await cloudinary.uploader.destroy(user.image.public_id);
    }

    return res.status(200).json({ message: "success", user });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};


export const updateProfile = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { userName, phone, address, gender } = req.body;

    const updateData = {};
    if (userName !== undefined) updateData.userName = userName;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (gender !== undefined) updateData.gender = gender;

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (req.files?.image?.length) {
      if (user.image?.public_id) {
        await cloudinary.uploader.destroy(user.image.public_id);
      }

      const folderName = userName || user.userName || "user";
      const { secure_url, public_id } = await cloudinary.uploader.upload(
        req.files.image[0].path,
        { folder: `${process.env.APP_NAME}/users/${folderName}` }
      );

      updateData.image = { secure_url, public_id };
    }

    const updatedUser = await userModel
      .findByIdAndUpdate(userId, updateData, { new: true })
      .select("userName email phone address gender role status image createdAt updatedAt");

    return res.status(200).json({ message: "success", user: updatedUser });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getProfile = async (req, res) => {
  try {
    const userId = req.user?._id;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await userModel
      .findById(userId)
      .select("userName email phone address gender role status image createdAt updatedAt");

    if (!user) return res.status(404).json({ message: "User not found" });

    return res.status(200).json({ message: "success", user });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};