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
import { format } from "date-fns";
import { useState } from "react";
import { DragHandleIcon } from "@shopify/polaris-icons";

export const Row = ({ id, type, drag, sitemapLoading, count, nextUpdate }) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transition,
    transform: CSS.Transform.toString(transform),
  };

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
      <td>2022-11-23</td>
      <td>{nextUpdate ? format(nextUpdate, "yyyy-MM-dd") : ""}</td>
    </tr>
  );
};

const SitemapTable = (props) => {
  const [drag, setDrag] = useState(false);
  const rows = props?.rows;
  const setRows = props?.setRows;
  const sitemapLoading = props?.sitemapLoading;
  const nextUpdate = props?.nextUpdate;

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
                nextUpdate={nextUpdate}
              />
            ))}
          </SortableContext>
        </table>
      </Card>
    </DndContext>
  );
};

export default SitemapTable;
