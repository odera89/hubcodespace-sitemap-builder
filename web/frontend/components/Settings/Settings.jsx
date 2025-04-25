import { Box, Button, Card, Page, Spinner, TextField } from "@shopify/polaris";
import { useEffect, useState } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";

const handleSave = async (setLoading, updateInterval, shopify) => {
  setLoading(true);
  try {
    if (updateInterval < 0) {
      shopify?.toast?.show("Update interval must be greater than 0");
      setLoading(false);
      return;
    }
    const result = await fetch(`/api/updateSettings`, {
      method: "POST",
      body: JSON?.stringify({ updateInterval }),
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

const getSettings = async (setLoading, setUpdateInterval) => {
  try {
    const result = await fetch(`/api/getSettings`, {
      method: "GET",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
    });
    const resultData = await result?.json();

    if (resultData?.data?.update_interval) {
      setUpdateInterval(resultData?.data?.update_interval);
    }

    setLoading(false);
  } catch {
    setLoading(false);
  }
};

const Settings = () => {
  const [updateInterval, setUpdateInterval] = useState(0);
  const [loadingButton, setLoadingButton] = useState(false);
  const [loading, setLoading] = useState(true);
  const shopify = useAppBridge();

  useEffect(() => {
    getSettings(setLoading, setUpdateInterval);
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
            handleSave(setLoadingButton, updateInterval, shopify);
          }}
        >
          Save
        </Button>
      }
    >
      <Card padding={{ xs: 500 }}>
        <Box maxWidth="250px">
          <TextField
            type="number"
            label="Update Interval"
            value={updateInterval}
            initialValue={updateInterval}
            onChange={(e) => setUpdateInterval(e)}
          />
        </Box>
      </Card>
    </Page>
  );
};
export default Settings;
