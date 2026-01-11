import mongoose from "mongoose";

const localizedStringSchema = new mongoose.Schema(
  {
    en: { type: String, default: "" },
    ar: { type: String, default: "" },
  },
  { _id: false }
);

const itemSchema = new mongoose.Schema(
  {
    title: localizedStringSchema,
    subtitle: localizedStringSchema,
    description: localizedStringSchema,
    buttonText: localizedStringSchema,
    buttonLink: String,
    badge: localizedStringSchema,
    image: {
      url: String,
      publicId: String,
    },
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const homeSectionSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, required: true },
    isActive: { type: Boolean, default: true },

    heading: {
      small: localizedStringSchema,
      title: localizedStringSchema,
      desc: localizedStringSchema,
    },

    cta: {
      text: localizedStringSchema,
      link: String,
    },

    layout: {
      type: String,
      enum: ["collage-leftText-rightImages"],
      default: "collage-leftText-rightImages",
    },

    items: [itemSchema],
  },
  { timestamps: true }
);

const HomeSection =
  mongoose.models.HomeSection || mongoose.model("HomeSection", homeSectionSchema);

export default HomeSection;
