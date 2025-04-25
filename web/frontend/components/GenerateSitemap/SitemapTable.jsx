import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { arrayMove, sortableKeyboardCoordinates } from "@dnd-kit/sortable";
import {
  SortableContext,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button, Card, Icon, InlineStack } from "@shopify/polaris";
import {
  format,
  addMonths,
  setHours,
  getHours,
  setMinutes,
  getMinutes,
  setDay,
  addWeeks,
  getDay,
  addDays,
} from "date-fns";
import { useState } from "react";
import { DragHandleIcon } from "@shopify/polaris-icons";

const DAYS_DATA = [
  { value: 1, day: "monday" },
  { value: 2, day: "tuesday" },
  { value: 3, day: "wednesday" },
  { value: 4, day: "thursday" },
  { value: 5, day: "friday" },
  { value: 6, day: "saturday" },
  { value: 7, day: "sunday" },
];

const getNextWeekday = (date, targetDay) => {
  const currentDay = getDay(date);
  const daysToAdd = (targetDay - currentDay + 7) % 7 || 7;
  return addDays(date, daysToAdd);
};

const handleNextUpdate = (settings, last_updated) => {
  const frequency = settings?.find((item) => item?.frequency)?.frequency;
  let nextUpdate = "never";
  let settingsData = settings;
  let day = "";
  let hour = "";
  let minutes = "";
  const lastDate = last_updated ? new Date(last_updated) : new Date();
  switch (frequency) {
    case "daily":
      const days = settingsData?.map(
        (item) => DAYS_DATA?.find((i) => i?.day === item?.on)?.value
      );
      hour = settingsData?.[0]?.hour ? getHours(settingsData?.[0]?.hour) : "";
      minutes = settingsData?.[0]?.hour
        ? getMinutes(settingsData?.[0]?.hour)
        : 0;
      const lastDay = getDay(lastDate);
      const nextDay = days?.find((item) => item > lastDay) || days?.[0];
      const nextDate = getNextWeekday(lastDate, nextDay);

      if (nextDate && hour) {
        nextUpdate = format(
          setHours(setMinutes(nextDate, minutes), hour),
          "yyyy-MM-dd HH:mm"
        );
      }

      break;
    case "weekly":
      settingsData = settings?.[0];
      day = DAYS_DATA?.find((item) => item?.day === settingsData?.on)?.value;
      hour = settingsData?.hour ? getHours(settingsData?.hour) : "";
      minutes = settingsData?.hour ? getMinutes(settingsData?.hour) : 0;
      if (day && hour) {
        nextUpdate = format(
          setHours(
            setMinutes(addWeeks(setDay(lastDate, day), 1), minutes),
            hour
          ),
          "yyyy-MM-dd HH:mm"
        );
      }
      break;
    case "monthly":
      settingsData = settings?.[0];
      day = settingsData?.day;
      hour = settingsData?.hour ? getHours(settingsData?.hour) : "";
      minutes = settingsData?.hour ? getMinutes(settingsData?.hour) : 0;
      if (day && hour) {
        nextUpdate = format(
          setHours(
            setMinutes(addMonths(setDay(lastDate, day + 1), 1), minutes),
            hour
          ),
          "yyyy-MM-dd HH:mm"
        );
      }

      break;
    default:
      break;
  }
  return nextUpdate;
};

export const Row = ({
  id,
  type,
  drag,
  sitemapLoading,
  count,
  settings,
  last_updated,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };
  const nextUpdate = handleNextUpdate(settings, last_updated);

  const lastUpdated = last_updated
    ? format(new Date(last_updated), "yyyy-MM-dd")
    : "";

  return (
    <tr style={{ ...style, cursor: drag ? "grabbing" : "" }} className="row">
      <td>
        <InlineStack gap="100">
          <div
            style={{ maxWidth: "20px", cursor: drag ? "grabbing" : "grab" }}
            {...attributes}
            {...listeners}
            ref={setNodeRef}
          >
            <Icon source={DragHandleIcon} tone="base" />
          </div>

          {type || ""}
        </InlineStack>
      </td>
      <td>
        <Button loading={sitemapLoading?.[type]} variant="monochromePlain">
          created
        </Button>
      </td>
      <td>{count}</td>
      <td>{lastUpdated}</td>
      <td>{nextUpdate}</td>
    </tr>
  );
};

const SitemapTable = (props) => {
  const [drag, setDrag] = useState(false);
  const rows = props?.rows;
  const setRows = props?.setRows;
  const sitemapLoading = props?.sitemapLoading;
  const settings = props?.settings;

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const getRowPos = (id) => rows.findIndex((row) => row?.id === id);

  const handleDragEnd = (event) => {
    const { active, over } = event;
    setDrag(false);
    if (active?.id === over?.id) return;

    setRows((rows) => {
      const originalPos = getRowPos(active?.id);
      const newPos = getRowPos(over?.id);

      return arrayMove(rows, originalPos, newPos);
    });
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragEnd={handleDragEnd}
      onDragStart={() => {
        setDrag(true);
      }}
    >
      <Card>
        <table className="table">
          <thead>
            <th>Sitemap</th>
            <th>Status</th>
            <th>#of items</th>
            <th>Last Updated</th>
            <th>Next Update</th>
          </thead>
          <SortableContext items={rows} strategy={verticalListSortingStrategy}>
            {rows.map((row) => (
              <Row
                key={row?.id}
                {...row}
                drag={drag}
                sitemapLoading={sitemapLoading}
                settings={settings}
              />
            ))}
          </SortableContext>
        </table>
      </Card>
    </DndContext>
  );
};

export default SitemapTable;
