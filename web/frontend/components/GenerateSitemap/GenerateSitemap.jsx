import { Button, Card, Icon, Spinner, Text } from "@shopify/polaris";
import { RefreshIcon, CheckCircleIcon } from "@shopify/polaris-icons";
import { useEffect, useRef, useState } from "react";
import SitemapTable from "../GenerateSitemap/SitemapTable";

const checkRunningJobs = async (setSitemapLoading, interval) => {
  try {
    const obj = {
      products: false,
      collections: false,
      pages: false,
      articles: false,
    };
    const result = await fetch(`/api/checkSitemap`, {
      method: "GET",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
    });
    const resultData = await result?.json();

    if (resultData?.data?.length > 0) {
      resultData?.data?.forEach((item) => {
        if (obj?.hasOwnProperty(item?.type)) {
          obj[item?.type] = true;
        }
      });

      setSitemapLoading(obj);
    } else {
      if (interval) {
        clearInterval(interval);
      }
      setSitemapLoading(obj);
    }
  } catch {}
};

const getPagesCount = async (setPages, setLoading, setSettings) => {
  try {
    const result = await fetch(`/api/pagesCount`, {
      method: "GET",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
    });
    const resultData = await result?.json();
    if (resultData?.data?.length > 0) {
      setPages(resultData?.data);
    }

    const settingsData = await fetch(`/api/getSettings`, {
      method: "GET",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
    });
    const settings = await settingsData?.json();
    if (settings?.data?.length > 0) {
      setSettings(settings?.data);
    }
    setLoading(false);
  } catch {
    setLoading(false);
  }
};

const generateXml = async (setSitemapLoading, pages) => {
  setSitemapLoading({
    products: true,
    collections: true,
    pages: true,
    articles: true,
  });

  try {
    const functionsObj = {
      products: {
        index: pages?.findIndex((item) => item?.type === "products") || 0,
      },
      collections: {
        index: pages?.findIndex((item) => item?.type === "collections") || 0,
      },
      pages: { index: pages?.findIndex((item) => item?.type === "pages") } || 0,
      articles: {
        index: pages?.findIndex((item) => item?.type === "articles") || 0,
      },
    };
    const xmlArr = [
      {
        type: "products",
        index: functionsObj?.products?.index,
        slug: "/products/",
      },
      {
        type: "collections",
        index: functionsObj?.collections?.index,
        slug: "/collections/",
      },
      {
        type: "pages",
        index: functionsObj?.pages?.index,
        slug: "/pages/",
      },
      {
        type: "articles",
        index: functionsObj?.articles?.index,
        slug: "/blogs/",
      },
    ];

    functionsObj.products.job = await fetch(`/api/productsXml`, {
      method: "POST",
      body: JSON?.stringify({ index: functionsObj?.products?.index, xmlArr }),
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
    });

    functionsObj.collections.job = await fetch(`/api/collectionsXml`, {
      method: "POST",
      body: JSON?.stringify({
        index: functionsObj?.collections?.index,
        xmlArr,
      }),
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
    });

    functionsObj.pages.job = await fetch(`/api/pagesXml`, {
      method: "POST",
      body: JSON?.stringify({ index: functionsObj?.pages?.index, xmlArr }),
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
    });

    functionsObj.articles.job = await fetch(`/api/articlesXml`, {
      method: "POST",
      body: JSON?.stringify({ index: functionsObj?.articles?.index, xmlArr }),
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
    });
    const obj = {
      products: true,
      collections: true,
      pages: true,
      articles: true,
    };

    const result = await Promise.all(
      Object?.keys(functionsObj)?.map(async (item) => {
        const resultData = await functionsObj?.[item]?.job;

        obj[item] = false;
        setSitemapLoading({ ...obj });
        return resultData;
      })
    );
  } catch {
    setSitemapLoading({
      products: false,
      collections: false,
      pages: false,
      articles: false,
    });
  }
};

const GenerateSitemap = () => {
  const [settings, setSettings] = useState([]);
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sitemapLoading, setSitemapLoading] = useState({
    products: false,
    collections: false,
    pages: false,
    articles: false,
  });
  const sitemapIsLoading = Object?.keys(sitemapLoading)?.find(
    (item) => sitemapLoading?.[item]
  );
  const interval = useRef(null);

  useEffect(() => {
    interval.current = setInterval(() => {
      checkRunningJobs(setSitemapLoading, interval?.current);
    }, 2000);
    checkRunningJobs(setSitemapLoading, interval?.current);
    getPagesCount(setPages, setLoading, setSettings);

    return () => {
      clearInterval(interval?.current);
    };
  }, []);

  if (loading) {
    return (
      <div className="loader-wrapper">
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <Card padding={{ xs: 500 }}>
      <div className="mb-10">
        <Text variant="headingLg">Step 1. Generate your sitemap</Text>
      </div>
      <div className="mb-15">
        <Text>
          Initial sitemap has been generated. The app will now keep your sitemap
          updated every 24 hours. Stats will be updated.
        </Text>
      </div>
      <div className="mb-15">
        <Text>
          Sitemap Url:{" "}
          <Button
            variant="plain"
            url="https://hubcode-space-inventory-management.myshopify.com/apps/hubcodespace-sitemap-builder/sitemap.xml"
          >
            https://hubcode-space-inventory-management.myshopify.com/apps/hubcodespace-sitemap-builder/sitemap.xml
          </Button>
          <strong></strong>
        </Text>
      </div>

      <div className="mb-10">
        <Text variant="headingLg">Generation Stats</Text>
      </div>
      <Text>
        The sitemaps get generated one at a time starting with products and
        works its way down the list.
      </Text>
      <div className={`info-box ${sitemapIsLoading ? "loading" : ""}`}>
        <Icon source={sitemapIsLoading ? RefreshIcon : CheckCircleIcon} />
        <p>
          {sitemapIsLoading
            ? "Sitemap generation in progress"
            : "Sitemap has generated"}
        </p>
      </div>

      <div className="mb-20">
        <SitemapTable
          setRows={setPages}
          rows={pages}
          sitemapLoading={sitemapLoading}
          settings={settings}
        />
      </div>
      <Button
        loading={sitemapIsLoading}
        onClick={() => {
          generateXml(setSitemapLoading, pages);
        }}
        icon={RefreshIcon}
        variant="primary"
        tone="success"
      >
        Refresh
      </Button>
    </Card>
  );
};

export default GenerateSitemap;
