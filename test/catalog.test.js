const { test, before, after } = require("node:test");
const assert = require("node:assert/strict");
const { createApp } = require("../app");
const token = "a-test-token-with-at-least-24-characters";
function repository() {
  let rows = [],
    id = 0;
  return {
    find: () => ({
      sort: () => ({ lean: async () => rows.map((row) => ({ ...row })) }),
    }),
    create: async (data) => {
      const row = { ...data, _id: (++id).toString(16).padStart(24, "0") };
      rows.push(row);
      return row;
    },
    findByIdAndUpdate: async (key, data) => {
      const row = rows.find((row) => row._id === key);
      if (!row) return null;
      Object.assign(row, data);
      return row;
    },
    findByIdAndDelete: async (key) => {
      const row = rows.find((row) => row._id === key);
      rows = rows.filter((row) => row._id !== key);
      return row;
    },
  };
}
let server, url;
before(async () => {
  server = createApp({
    Product: repository(),
    Category: repository(),
    adminToken: token,
  }).listen(0, "127.0.0.1");
  await new Promise((resolve) => server.once("listening", resolve));
  url = `http://127.0.0.1:${server.address().port}/api`;
});
after(() => new Promise((resolve) => server.close(resolve)));
const send = (path, method = "GET", data, authorized = true) =>
  fetch(url + path, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(authorized ? { Authorization: `Bearer ${token}` } : {}),
    },
    ...(data ? { body: JSON.stringify(data) } : {}),
  });
test("health, public listing and missing routes", async () => {
  assert.equal((await send("/health")).status, 200);
  assert.deepEqual(
    await (await send("/products", "GET", null, false)).json(),
    []
  );
  assert.equal((await send("/api/products")).status, 404);
});
test("writes require credentials; malformed payloads and IDs fail", async () => {
  assert.equal((await send("/products", "POST", {}, false)).status, 401);
  assert.equal((await send("/products", "POST", {})).status, 400);
  assert.equal((await send("/products/not-an-id", "DELETE")).status, 400);
  const response = await fetch(url + "/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: "{bad",
  });
  assert.equal(response.status, 400);
});
test("category and product create, list, edit, delete journey", async () => {
  for (const resource of ["categories", "products"]) {
    const data = {
      name: "Everyday",
      description: "A test item",
      imageUrl: "https://example.com/item.jpg",
      ...(resource === "products"
        ? { country: "Cameroon", category: "Everyday", tags: ["cotton"] }
        : {}),
    };
    const created = await send("/" + resource, "POST", data);
    assert.equal(created.status, 201);
    const row = await created.json();
    assert.equal((await (await send("/" + resource)).json()).length, 1);
    const updated = await send(`/${resource}/${row._id}`, "PUT", {
      ...data,
      name: "Updated",
    });
    assert.equal(updated.status, 200);
    assert.equal((await updated.json()).name, "Updated");
    assert.equal((await send(`/${resource}/${row._id}`, "DELETE")).status, 204);
    assert.equal((await send(`/${resource}/${row._id}`, "DELETE")).status, 404);
  }
});
test("unsafe image schemes and operator-shaped input are rejected", async () => {
  const data = {
    name: "Unsafe",
    description: "test",
    imageUrl: "javascript:alert(1)",
  };
  assert.equal((await send("/categories", "POST", data)).status, 400);
  assert.equal(
    (await send("/categories", "POST", { ...data, name: { $ne: "" } })).status,
    400
  );
});
