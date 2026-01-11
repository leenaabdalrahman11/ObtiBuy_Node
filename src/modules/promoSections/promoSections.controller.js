import HomeSection from "../../../DB/models/promoSections.model.js";
import Product from "../../../DB/models/product.model.js";

export const createHomeSection = async (req, res, next) => {
  try {
    const { key, isActive = true, heading, cta, items = [] } = req.body;

    if (!key) return res.status(400).json({ message: "key is required" });

    const exists = await HomeSection.findOne({ key });
    if (exists) {
      return res.status(409).json({ message: "Section with this key already exists" });
    }

    const cleanItems = items.map((it, index) => ({
      productId: it.productId || null,
      badge: {
        en: it.badge?.en || "",
        ar: it.badge?.ar || "",
      },
      buttonLink: it.buttonLink || "",
      order: it.order ?? index + 1,
    }));

    const section = await HomeSection.create({
      key,
      isActive,
      heading: {
        small: { en: heading?.small?.en || "", ar: heading?.small?.ar || "" },
        title: { en: heading?.title?.en || "", ar: heading?.title?.ar || "" },
        desc: { en: heading?.desc?.en || "", ar: heading?.desc?.ar || "" },
      },
      cta: {
        text: { en: cta?.text?.en || "", ar: cta?.text?.ar || "" },
        link: cta?.link || "",
      },
      items: cleanItems,
    });

    return res.status(201).json({ success: true, section });
  } catch (e) {
    next(e);
  }
};

export const getHomeSectionByKey = async (req, res, next) => {
  try {
    const { key } = req.params;

    const section = await HomeSection.findOne({ key }).lean();
    if (!section) return res.status(404).json({ message: "Not found" });

    const ids = (section.items || []).map((i) => i.productId).filter(Boolean);

    const products = await Product.find({ _id: { $in: ids } })
      .select("_id name mainImage discount")
      .lean();

    const map = new Map(products.map((p) => [String(p._id), p]));

    section.items = (section.items || []).map((it) => {
      const p = map.get(String(it.productId));

      const hasBadge =
        (it.badge && typeof it.badge === "object" && (it.badge.en || it.badge.ar)) ||
        (typeof it.badge === "string" && it.badge.trim().length);

      const autoBadge = p?.discount ? `-${p.discount}%` : "";

      return {
        ...it,
        image: { url: p?.mainImage?.secure_url || "" },
        badge: hasBadge ? it.badge : { en: autoBadge, ar: autoBadge },
        buttonLink:
          it.buttonLink || (it.productId ? `/product-details/${it.productId}` : "#"),
      };
    });

    return res.json({ section });
  } catch (e) {
    next(e);
  }
};

const toLocalized = (v) => {
  if (v == null) return undefined;
  if (typeof v === "string") return { en: v, ar: v }; 
  if (typeof v === "object") {
    return { en: v.en || "", ar: v.ar || "" };
  }
  return { en: "", ar: "" };
};

export const updateHomeSection = async (req, res, next) => {
  try {
    const { key } = req.params;

    const toLocalized = (v) => {
      if (v == null) return undefined;
      if (typeof v === "string") return { en: v, ar: v }; 
      if (typeof v === "object") return { en: v.en || "", ar: v.ar || "" };
      return { en: "", ar: "" };
    };

    const body = req.body || {};
    const update = { ...body };

    if (body.heading) {
      update.heading = { ...(body.heading || {}) };
      if ("small" in body.heading) update.heading.small = toLocalized(body.heading.small);
      if ("title" in body.heading) update.heading.title = toLocalized(body.heading.title);
      if ("desc" in body.heading) update.heading.desc = toLocalized(body.heading.desc);
    }

    if (body.cta) {
      update.cta = { ...(body.cta || {}) };
      if ("text" in body.cta) update.cta.text = toLocalized(body.cta.text);
    }

    if (Array.isArray(body.items)) {
      update.items = body.items.map((it) => ({
        ...it,
        badge: toLocalized(it.badge),
      }));
    }

    const updatedSection = await HomeSection.findOneAndUpdate(
      { key },
      update,
      { new: true, runValidators: true }
    );

    if (!updatedSection) {
      return res.status(404).json({ message: "Section not found" });
    }

    res.json({ section: updatedSection });
  } catch (e) {
    next(e);
  }
};

