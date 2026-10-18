const mongoose = require("mongoose");
const { createApp } = require("./app");
async function start() {
  if (!process.env.ADMIN_TOKEN || process.env.ADMIN_TOKEN.length < 24)
    throw new Error(
      "Set ADMIN_TOKEN to a random value of at least 24 characters"
    );
  await mongoose.connect(
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/buymore",
    { serverSelectionTimeoutMS: 5000 }
  );
  const server = createApp().listen(Number(process.env.PORT || 5000), () =>
    console.log("BuyMore API is listening")
  );
  for (const signal of ["SIGTERM", "SIGINT"])
    process.once(signal, () =>
      server.close(() => mongoose.disconnect().then(() => process.exit(0)))
    );
}
if (require.main === module)
  start().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
module.exports = { start };
