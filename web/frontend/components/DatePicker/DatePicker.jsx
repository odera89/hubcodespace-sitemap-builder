import React, { useState, useCallback, useEffect, useRef } from "react";
import { DatePicker, TextField, Icon, Popover } from "@shopify/polaris";
import { CalendarIcon } from "@shopify/polaris-icons";

const toInt = (time) =>
    ((h, m) => h * 2 + m / 30)(...time.split(":").map(parseFloat)),
  toTime = (int) => [Math.floor(int / 2), int % 2 ? "30" : "00"].join(":"),
  range = (from, to) =>
    Array(to - from + 1)
      .fill()
      .map((_, i) => from + i),
  eachHalfHour = (t1, t2) => range(...[t1, t2].map(toInt)).map(toTime);

const timeList = eachHalfHour("00:00", "23:30");

const timezoneOffsetDate = (d) => {
  const offset = new Date().getTimezoneOffset();
  const date = new Date(d.getTime() - offset * 60 * 1000);
  return date;
};

const getDateString = (d) => {
  const date = timezoneOffsetDate(d);
  return date.toISOString().split("T")[0];
};

const getTimeString = (d) => {
  const date = timezoneOffsetDate(d);
  const dateSplit = date.toISOString().split("T")[1].split(":");
  return `${dateSplit[0]}:${dateSplit[1]}`;
};

const today = new Date();

export const DateTimePicker = ({
  initialValue = Date.now(),
  dateLabel = "Date",
  onChange = () => {},
}) => {
  const isInitialMount = useRef(true);

  const [{ month, year }, setDate] = useState({
    month: today.getMonth(),
    year: today.getFullYear(),
  });
  const [datePopoverActive, setDatePopoverActive] = useState(false);
  const [selectedDates, setSelectedDates] = useState(
    initialValue
      ? { start: new Date(initialValue), end: new Date(initialValue) }
      : { start: new Date(), end: new Date() }
  );

  const [selectedTime, setSelectedTime] = useState(
    initialValue ? getTimeString(new Date(initialValue)) : ""
  );

  const dateString = getDateString(selectedDates.start);

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
    } else if (selectedTime && selectedDates.start) {
      onChange(
        new Date(`${getDateString(selectedDates.start)} ${selectedTime}`)
      );
    }
  }, [selectedDates, selectedTime]);

  const onDateChange = useCallback((v) => {
    setSelectedDates(v);
    setDatePopoverActive(false);
  }, []);

  const toggleDatePopoverActive = useCallback(
    () => setDatePopoverActive((v) => !v),
    []
  );

  const handleMonthChange = useCallback(
    (month, year) => setDate({ month, year }),
    []
  );

  const dateActivator = (
    <TextField
      label={dateLabel}
      value={dateString}
      prefix={<Icon source={CalendarIcon} />}
      onFocus={toggleDatePopoverActive}
    />
  );

  return (
    <>
      <Popover
        preferredPosition="above"
        active={datePopoverActive}
        activator={dateActivator}
        onClose={toggleDatePopoverActive}
      >
        <div style={{ padding: "16px" }}>
          <DatePicker
            month={month}
            year={year}
            onChange={onDateChange}
            onMonthChange={handleMonthChange}
            selected={selectedDates}
          />
        </div>
      </Popover>
    </>
  );
};

export default DateTimePicker;
