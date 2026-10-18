const express = require("express");
const { timingSafeEqual } = require("node:crypto");
const asyncRoute = (fn) => (req, res, next) =>
  Promise.resolve(fn(req, res)).catch(next);
const validId = (id) => /^[a-f0-9]{24}$/i.test(id);
function validate(body, product) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return null;
  const fields = product
    ? ["name", "description", "imageUrl", "country", "category"]
    : ["name", "description", "imageUrl"];
  const data = {};
  for (const field of fields) {
    const value =
      field === "name" && !product
        ? body.name ?? body.categoryName
        : body[field];
    if (
      typeof value !== "string" ||
      !value.trim() ||
      value.length > (field === "description" ? 3000 : 500)
    )
      return null;
    data[field] = value.trim();
  }
  try {
    if (!["https:", "http:"].includes(new URL(data.imageUrl).protocol))
      return null;
  } catch {
    return null;
  }
  if (product) {
    if (
      body.tags !== undefined &&
      (!Array.isArray(body.tags) ||
        body.tags.length > 20 ||
        body.tags.some((tag) => typeof tag !== "string" || tag.length > 60))
    )
      return null;
    data.tags = (body.tags || []).map((tag) => tag.trim()).filter(Boolean);
  }
  return data;
}
function createCatalogRouter({ Product, Category, adminToken }) {
  const router = express.Router();
  const authorize = (req, res, next) => {
    if (!adminToken)
      return res
        .status(503)
        .json({ error: "Catalog editing is not configured" });
    const actual = Buffer.from(req.get("Authorization") || "");
    const expected = Buffer.from(`Bearer ${adminToken}`);
    if (actual.length !== expected.length || !timingSafeEqual(actual, expected))
      return res
        .status(401)
        .json({ error: "Catalog editing requires the admin token" });
    next();
  };
  for (const [resource, Model, product] of [
    ["products", Product, true],
    ["categories", Category, false],
  ]) {
    router.get(
      `/${resource}`,
      asyncRoute(async (req, res) => {
        const records = await Model.find({}).sort({ _id: -1 }).lean();
        res.json(records);
      })
    );
    router.post(
      `/${resource}`,
      authorize,
      asyncRoute(async (req, res) => {
        const data = validate(req.body, product);
        if (!data)
          return res
            .status(400)
            .json({
              error: "Complete every field and provide an HTTP(S) image URL",
            });
        res.status(201).json(await Model.create(data));
      })
    );
    router.put(
      `/${resource}/:id`,
      authorize,
      asyncRoute(async (req, res) => {
        if (!validId(req.params.id))
          return res.status(400).json({ error: "Invalid item ID" });
        const data = validate(req.body, product);
        if (!data)
          return res
            .status(400)
            .json({
              error: "Complete every field and provide an HTTP(S) image URL",
            });
        const record = await Model.findByIdAndUpdate(req.params.id, data, {
          new: true,
          runValidators: true,
        });
        if (!record) return res.status(404).json({ error: "Item not found" });
        res.json(record);
      })
    );
    router.delete(
      `/${resource}/:id`,
      authorize,
      asyncRoute(async (req, res) => {
        if (!validId(req.params.id))
          return res.status(400).json({ error: "Invalid item ID" });
        const record = await Model.findByIdAndDelete(req.params.id);
        if (!record) return res.status(404).json({ error: "Item not found" });
        res.status(204).end();
      })
    );
  }
  return router;
}
module.exports = { createCatalogRouter };
