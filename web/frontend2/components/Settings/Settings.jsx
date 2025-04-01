import { Box, Button, Card, Page, Spinner } from "@shopify/polaris";
import DateTimePicker from "../DatePicker/DatePicker";
import { useEffect, useState } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";

const handleSave = async (setLoading, nextUpdate, shopify) => {
  setLoading(true);
  try {
    const result = await fetch(`/api/updateSettings`, {
      method: "POST",
      body: JSON?.stringify({ nextUpdate }),
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
    });
    const resultData = await result?.json();
    if (resultData?.data) {
      shopify?.toast?.show("Settings updated successfully.");
      setLoading(false);
      return;
    }

    shopify?.toast?.show("Update settings failed.");
    setLoading(false);
  } catch {
    shopify?.toast?.show("Update settings failed.");
    setLoading(false);
  }
};

const getSettings = async (setLoading, setNextUpdate) => {
  try {
    const result = await fetch(`/api/getSettings`, {
      method: "GET",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
    });
    const resultData = await result?.json();
    if (resultData?.data?.next_update) {
      setNextUpdate(resultData?.data?.next_update);
    }

    setLoading(false);
  } catch {
    setLoading(false);
  }
};

const Settings = () => {
  const [nextUpdate, setNextUpdate] = useState(new Date());
  const [loadingButton, setLoadingButton] = useState(false);
  const [loading, setLoading] = useState(true);
  const shopify = useAppBridge();

  useEffect(() => {
    getSettings(setLoading, setNextUpdate);
  }, []);

  if (loading) {
    return (
      <div className="loader-wrapper">
        <Spinner size="large" />
      </div>
    );
  }

  return (
    <Page
      title="Settings"
      primaryAction={
        <Button
          variant="primary"
          tone="success"
          loading={loadingButton}
          onClick={() => {
            handleSave(setLoadingButton, nextUpdate, shopify);
          }}
        >
          Save
        </Button>
      }
    >
      <Card padding={{ xs: 500 }}>
        <Box maxWidth="250px">
          <DateTimePicker
            dateLabel="Next Update"
            initialValue={nextUpdate}
            onChange={(e) => setNextUpdate(e)}
          />
        </Box>
      </Card>
    </Page>
  );
};
export default Settings;
