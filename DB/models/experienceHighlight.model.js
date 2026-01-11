import mongoose from "mongoose";

const localizedStringSchema = new mongoose.Schema(
  {
    en: { type: String, default: "" },
    ar: { type: String, default: "" },
  },
  { _id: false }
);

const experienceHighlightSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, required: true },

    titleSmall: { type: localizedStringSchema, default: () => ({ en: "EXPERIENCES", ar: "الخبرات" }) },
    title: { type: localizedStringSchema, required: true },
    description: { type: localizedStringSchema, required: true },

    buttonText: { type: localizedStringSchema, default: () => ({ en: "More Info", ar: "مزيد من المعلومات" }) },
    buttonLink: { type: String, default: "/shop" },

    image: {
      secure_url: { type: String, default: "" },
      public_id: { type: String, default: "" },
    },
  },
  { timestamps: true, collection: "experience_highlights" }
);

const ExperienceHighlight =
  mongoose.models.ExperienceHighlight ||
  mongoose.model("ExperienceHighlight", experienceHighlightSchema);

export default ExperienceHighlight;
