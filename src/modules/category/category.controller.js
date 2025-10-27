import slugify from 'slugify';

export const create = (req, res) => {
  const { name } = req.body || {};
  if (!name) return res.status(400).json({ message: "name is required" });

  const slug = slugify(name);
  const userId = req.user.id;           
  return res.status(201).json({
    message: "Category created",
    name,
    slug,
    createdBy: userId
  });
};
