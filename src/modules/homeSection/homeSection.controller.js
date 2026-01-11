import cloudinary from "../../utils/cloudinary.js";
import HomeSection from "../../../DB/models/experienceHighlight.model.js";

export const getSectionByKey = async (req, res) => {
  const { key } = req.params;
  const section = await HomeSection.findOne({ key });
  return res.json({ section });
};

export const upsertSectionByKey = async (req, res) => {
  const { key } = req.params;

  const {
    titleSmall_en,
    titleSmall_ar,
    title_en,
    title_ar,
    description_en,
    description_ar,
    buttonText_en,
    buttonText_ar,
    buttonLink,
  } = req.body;

  const missing = [];
  if (!title_en) missing.push("title_en");
  if (!title_ar) missing.push("title_ar");
  if (!description_en) missing.push("description_en");
  if (!description_ar) missing.push("description_ar");

  if (missing.length) {
    return res.status(400).json({
      message: "Please provide Arabic and English text",
      missing,
    });
  }

  const section =
    (await HomeSection.findOne({ key })) || new HomeSection({ key });

  section.titleSmall = {
    en: titleSmall_en ?? section.titleSmall?.en ?? "EXPERIENCES",
    ar: titleSmall_ar ?? section.titleSmall?.ar ?? "الخبرات",
  };

  section.title = { en: title_en, ar: title_ar };
  section.description = { en: description_en, ar: description_ar };

  section.buttonText = {
    en: buttonText_en ?? section.buttonText?.en ?? "More Info",
    ar: buttonText_ar ?? section.buttonText?.ar ?? "مزيد من المعلومات",
  };

  if (buttonLink != null) section.buttonLink = buttonLink;

  if (req.file) {
    if (section.image?.public_id) {
      await cloudinary.uploader.destroy(section.image.public_id);
    }
    const uploaded = await cloudinary.uploader.upload(req.file.path, {
      folder: `${process.env.APP_NAME}/home-sections/${key}`,
    });
    section.image = {
      secure_url: uploaded.secure_url,
      public_id: uploaded.public_id,
    };
  }

  await section.save();
  return res.json({ message: "updated", section });
};
