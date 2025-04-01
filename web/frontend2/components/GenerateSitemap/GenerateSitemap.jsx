import { Button, Card, DataTable, Icon, Spinner, Text } from "@shopify/polaris";
import { RefreshIcon, CheckCircleIcon } from "@shopify/polaris-icons";
import { useEffect, useRef, useState } from "react";
import { format } from "date-fns";

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

const getPagesCount = async (setPages, setLoading, setNextUpdate) => {
  try {
    const result = await fetch(`/api/pagesCount`, {
      method: "GET",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
    });
    const resultData = await result?.json();
    if (resultData?.data) {
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
    if (settings?.data?.next_update) {
      setNextUpdate(settings?.data?.next_update);
    }
    setLoading(false);
  } catch {
    setLoading(false);
  }
};

const generateXml = async (sitemapLoading, setSitemapLoading) => {
  setSitemapLoading({
    products: true,
    collections: true,
    pages: true,
    articles: true,
  });
  try {
    const functionsObj = {};

    functionsObj.products = fetch(`/api/productsXml`, {
      method: "GET",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
    });

    functionsObj.collections = fetch(`/api/collectionsXml`, {
      method: "GET",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
    });

    functionsObj.pages = fetch(`/api/pagesXml`, {
      method: "GET",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
    });

    functionsObj.articles = fetch(`/api/articlesXml`, {
      method: "GET",
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
        const resultData = await functionsObj?.[item];
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
  const [nextUpdate, setNextUpdate] = useState("");
  const [pages, setPages] = useState({});
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
    getPagesCount(setPages, setLoading, setNextUpdate);

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

  const rows = Object?.keys(pages)?.map((item) => {
    const count = pages?.[item];

    return [
      [item],
      <Button loading={sitemapLoading?.[item]} variant="monochromePlain">
        created
      </Button>,
      count,
      "2022-11-23",
      nextUpdate ? format(nextUpdate, "yyyy-MM-dd") : "",
    ];
  });

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
        <Card>
          <DataTable
            columnContentTypes={["text", "text", "text", "text", "text"]}
            headings={[
              "Sitemap",
              "Status",
              "#of items",
              "Last Updated",
              "Next Update",
            ]}
            rows={rows}
          />
        </Card>
      </div>
      <Button
        loading={sitemapIsLoading}
        onClick={() => {
          generateXml(sitemapLoading, setSitemapLoading);
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
