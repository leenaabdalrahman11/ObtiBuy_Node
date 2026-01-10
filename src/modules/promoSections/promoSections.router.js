import { Router } from "express";
import {
  getHomeSectionByKey,
  updateHomeSection,
  createHomeSection
} from "../promoSections/promoSections.controller.js";
import PromoSection from "../../../DB/models/promoSections.model.js";
const router = Router();

router.get("/:key", getHomeSectionByKey);
router.patch("/:key", updateHomeSection);
router.post("/", createHomeSection); 
router.post("/seed", async (req, res, next) => {
  try {
    const section = await HomeSection.findOneAndUpdate(
      { key: "featured-collage" },
      {
        key: "featured-collage",
        isActive: true,
        heading: {
          small: "FEATURED",
          title: "Discover Our Best Collections",
          desc: "Shop curated picks across categories.",
        },
        cta: { text: "Shop Now", link: "/products" },
        items: [] 
      },
      { upsert: true, new: true }
    );

    res.json({ section });
  } catch (e) {
    next(e);
  }
});

export default router;
