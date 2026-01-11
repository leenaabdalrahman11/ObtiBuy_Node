import SettingsModel from "../../../DB/models/settings.model.js";

export const setHomeProductsTag = async (req, res) => {
  const { homeProductsTag } = req.body;

  if (!homeProductsTag?.trim()) {
    return res.status(400).json({ message: "homeProductsTag is required" });
  }

  let settings = await SettingsModel.findOne();
  if (!settings) settings = await SettingsModel.create({ homeProductsTag });

  settings.homeProductsTag = homeProductsTag.trim();
  await settings.save();

  return res.status(200).json({ message: "success", settings });
};

export const getHomeProductsTag = async (req, res) => {
  let settings = await SettingsModel.findOne();
  if (!settings)
    settings = await SettingsModel.create({ homeProductsTag: "black" });
  return res.status(200).json({ settings });
};
