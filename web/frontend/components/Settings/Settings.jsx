import {
  BlockStack,
  Box,
  Button,
  Checkbox,
  InlineStack,
  Page,
  RadioButton,
  Select,
  Spinner,
  Text,
  TextField,
} from "@shopify/polaris";
import { useEffect, useState } from "react";
import { useAppBridge } from "@shopify/app-bridge-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

const DAYS_DATA = [
  { value: "monday", label: "Monday" },
  { value: "tuesday", label: "Tuesday" },
  { value: "wednesday", label: "Wednesday" },
  { value: "thursday", label: "Thursday" },
  { value: "friday", label: "Friday" },
  { value: "saturday", label: "Saturday" },
  { value: "sunday", label: "Sunday" },
];

const handleSave = async (
  setLoading,
  shopify,
  frequency,
  days,
  day,
  monthlyDay,
  hour
) => {
  setLoading(true);

  try {
    const frequencyValue = frequency;
    let prepareData = [];
    const currentDate = new Date();
    switch (frequencyValue) {
      case "daily":
        prepareData = days?.map((item) => {
          return {
            frequency: "daily",
            on: item,
            hour: hour,
            created_at: currentDate,
            updated_at: currentDate,
          };
        });
        break;
      case "weekly":
        prepareData = [
          {
            frequency: "weekly",
            on: day,
            hour,
            created_at: currentDate,
            updated_at: currentDate,
          },
        ];
        break;
      case "monthly":
        prepareData = [
          {
            frequency: "monthly",
            day: monthlyDay,
            hour,
            created_at: currentDate,
            updated_at: currentDate,
          },
        ];
        break;

      default:
        prepareData = [
          {
            frequency: "never",
            created_at: currentDate,
            updated_at: currentDate,
          },
        ];
        break;
    }

    if (prepareData?.length <= 0) {
      shopify?.toast?.show("Update settings failed.");
      setLoading(false);
      return;
    }
    const result = await fetch(`/api/updateSettings`, {
      method: "POST",
      body: JSON?.stringify({ fieldsToAdd: prepareData }),
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
  } catch (e) {
    shopify?.toast?.show("Update settings failed.");
    setLoading(false);
  }
};

const getSettings = async (
  setLoading,
  setFrequency,
  setDays,
  setDay,
  setMonthlyDay,
  setHour
) => {
  try {
    const result = await fetch(`/api/getSettings`, {
      method: "GET",
      headers: {
        Accept: "application/json, text/plain, */*",
        "Content-Type": "application/json",
      },
    });
    const resultData = await result?.json();

    if (resultData?.data?.length > 0) {
      let settings = resultData?.data;
      const frequency = settings?.find((item) => item?.frequency)?.frequency;

      if (frequency) {
        switch (frequency) {
          case "daily":
            const daysArr = settings?.map((item) => item?.on);
            const hour = settings?.[0]?.hour;

            if (daysArr?.length > 0) {
              setDays(daysArr);
            }
            if (hour) {
              setHour(new Date(hour));
            }

            break;
          case "weekly":
            settings = settings?.[0];
            if (settings?.hour) {
              setHour(new Date(settings?.hour));
            }
            if (settings?.on) {
              setDay(settings?.on);
            }
            break;
          case "monthly":
            settings = settings?.[0];

            if (settings?.hour) {
              setHour(new Date(settings?.hour));
            }
            if (settings?.day) {
              setMonthlyDay(settings?.day);
            }

            break;
          default:
            break;
        }
        setFrequency(frequency);
      }
    }

    setLoading(false);
  } catch {
    setLoading(false);
  }
};

const handleChangeFrequency = (value, setFrequency) => {
  setFrequency(value);
};

const handleDaysChange = (value, days, setDays) => {
  let newArr = [...days];
  const findDay = newArr?.find((item) => item === value);
  if (findDay) {
    newArr = newArr?.filter((item) => item != value);
  } else {
    newArr = [...newArr, value];
  }
  setDays(newArr);
};

const handleDayChange = (value, setDay) => {
  setDay(value);
};

const handleMonthlyDayChange = (value, setMonthlyDay) => {
  if (value <= 0 || value > 31) return;
  setMonthlyDay(value);
};

const Settings = () => {
  const [loadingButton, setLoadingButton] = useState(false);
  const [loading, setLoading] = useState(true);
  const [frequency, setFrequency] = useState("daily");
  const [days, setDays] = useState(["monday"]);
  const [day, setDay] = useState("monday");
  const [monthlyDay, setMonthlyDay] = useState(1);
  const [hour, setHour] = useState(new Date());
  const shopify = useAppBridge();

  useEffect(() => {
    getSettings(
      setLoading,
      setFrequency,
      setDays,
      setDay,
      setMonthlyDay,
      setHour
    );
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
            handleSave(
              setLoadingButton,
              shopify,
              frequency,
              days,
              day,
              monthlyDay,
              hour
            );
          }}
        >
          Save
        </Button>
      }
    >
      <div>
        <div style={{ marginBottom: "20px" }}>
          <InlineStack blockAlign="center" gap={200}>
            <div style={{ minWidth: "60px" }}>
              <InlineStack align="end">
                <Text>Frequency:</Text>
              </InlineStack>
            </div>
            <BlockStack gap={150}>
              <InlineStack gap={300}>
                <RadioButton
                  label="daily, on"
                  checked={frequency === "daily"}
                  name="frequency"
                  id="daily"
                  onChange={(_, value) => {
                    handleChangeFrequency(value, setFrequency);
                  }}
                />
                {DAYS_DATA?.map((item, index) => {
                  const label = item?.label;
                  const value = item?.value;
                  const isChecked = days?.find((i) => i === value);
                  return (
                    <Checkbox
                      key={index}
                      label={label}
                      checked={isChecked}
                      onChange={() => {
                        handleDaysChange(value, days, setDays);
                      }}
                    />
                  );
                })}
              </InlineStack>
              <InlineStack gap={300}>
                <RadioButton
                  label="weekly, on"
                  checked={frequency === "weekly"}
                  name="frequency"
                  id="weekly"
                  onChange={(_, value) => {
                    handleChangeFrequency(value, setFrequency);
                  }}
                />
                <Select
                  options={DAYS_DATA}
                  onChange={(value) => {
                    handleDayChange(value, setDay);
                  }}
                  value={day}
                />
              </InlineStack>
              <InlineStack gap={300}>
                <RadioButton
                  label="monthly, on day"
                  checked={frequency === "monthly"}
                  name="frequency"
                  id="monthly"
                  onChange={(_, value) => {
                    handleChangeFrequency(value, setFrequency);
                  }}
                />
                <Box maxWidth="100px">
                  <TextField
                    type="number"
                    value={monthlyDay}
                    onChange={(value) => {
                      handleMonthlyDayChange(value, setMonthlyDay);
                    }}
                  />
                </Box>
              </InlineStack>
              <InlineStack gap={300}>
                <RadioButton
                  label="never"
                  checked={frequency === "never"}
                  name="frequency"
                  id="never"
                  onChange={(_, value) => {
                    handleChangeFrequency(value, setFrequency);
                  }}
                />
              </InlineStack>
            </BlockStack>
          </InlineStack>
        </div>

        <InlineStack gap={300} blockAlign="center">
          <div style={{ minWidth: "60px" }}>
            <InlineStack align="end">
              <Text>Hour:</Text>
            </InlineStack>
          </div>
          <div className="date-picker-wrapper">
            <DatePicker
              showTimeSelect
              showTimeSelectOnly
              timeIntervals={15}
              timeCaption="Time"
              dateFormat="h:mm aa"
              selected={hour}
              onChange={(date) => setHour(date)}
            />
          </div>
        </InlineStack>
      </div>
    </Page>
  );
};
export default Settings;
