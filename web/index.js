// @ts-check
import { join } from "path";
import { readFileSync } from "fs";
import express from "express";
import serveStatic from "serve-static";
import shopify from "./shopify.js";
import PrivacyWebhookHandlers from "./privacy.js";
import pagesCount from "./api/sitemap/pagesCount.js";
import productsXml from "./api/sitemap/productsXml.js";
import collectionsXml from "./api/sitemap/collectionsXml.js";
import pagesXml from "./api/sitemap/pagesXml.js";
import articlesXml from "./api/sitemap/articlesXml.js";

const PORT = parseInt(
  process.env.BACKEND_PORT || process.env.PORT || "3000",
  10
);

const STATIC_PATH =
  process.env.NODE_ENV === "production"
    ? `${process.cwd()}/frontend/dist`
    : `${process.cwd()}/frontend/`;

const app = express();

// Set up Shopify authentication and webhook handling
app.get(shopify.config.auth.path, shopify.auth.begin());
app.get(
  shopify.config.auth.callbackPath,
  shopify.auth.callback(),
  shopify.redirectToShopifyOrAppRoot()
);
app.post(
  shopify.config.webhooks.path,
  shopify.processWebhooks({ webhookHandlers: PrivacyWebhookHandlers })
);

// If you are adding routes outside of the /api path, remember to
// also add a proxy rule for them in web/frontend/vite.config.js

app.use("/api/*", shopify.validateAuthenticatedSession());
app.use("/subscription/*", authenticateUser);

async function authenticateUser(req, res, next) {
  const shop = req?.query?.shop;
  const storeName = await shopify?.config?.sessionStorage?.findSessionsByShop(
    shop
  );

  if (shop === storeName?.[0]?.shop) {
    next();
  } else {
    res.send("/account");
  }
}
app.use(express.json());

app.get("/sitemap/sitemap.xml", (req, res) => {
  res.sendFile(`${process.cwd()}/sitemap.xml`);
});

app.get("/api/pagesCount", pagesCount);
app.get("/api/productsXml", productsXml);
app.get("/api/collectionsXml", collectionsXml);
app.get("/api/pagesXml", pagesXml);
app.get("/api/articlesXml", articlesXml);

app.use(shopify.cspHeaders());
app.use(serveStatic(STATIC_PATH, { index: false }));

app.use("/*", shopify.ensureInstalledOnShop(), async (_req, res, _next) => {
  return res
    .status(200)
    .set("Content-Type", "text/html")
    .send(
      readFileSync(join(STATIC_PATH, "index.html"))
        .toString()
        .replace("%VITE_SHOPIFY_API_KEY%", process.env.SHOPIFY_API_KEY || "")
    );
});

app.listen(PORT);
