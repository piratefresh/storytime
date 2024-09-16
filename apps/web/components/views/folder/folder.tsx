import { useState } from "react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Icon } from "@/components/ui/icon";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { TypographyH1, TypographyH4 } from "@/components/ui/typography";
import {
  closestCenter,
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFormState } from "react-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";

function BreadcrumbsFolder() {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink href="/">Story</BreadcrumbLink>
        </BreadcrumbItem>
        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbLink href="/components">Create a Folder</BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export const createFolderSchema = z.object({
  storyId: z.string().trim().min(1, {
    message: "Story ID is required.",
  }),
  name: z.string().trim(),
  description: z.string().trim(),
});

type FormData = z.infer<typeof createFolderSchema>;

export function Folder() {
  const form = useForm<FormData>({
    resolver: zodResolver(createFolderSchema),
  });

  const { errors } = form.formState;

  // const [state, dispatch] = useFormState(onAction, undefined);

  return (
    <div className="flex h-full flex-col gap-4 bg-neutral-900 p-4">
      <BreadcrumbsFolder />

      <TypographyH1 className="text-neutral-400">Create a Folder</TypographyH1>

      <Form {...form}>
        {/* <form action={dispatch} className="flex flex-col gap-4"> */}
        <form className="flex flex-col gap-4">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    className="rounded-md border border-neutral-600 bg-neutral-800"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    className="rounded-md border border-neutral-600 bg-neutral-800"
                    rows={6}
                    placeholder="A description of types of files inside this folder"
                    {...field}
                  />
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Folder View</FormLabel>
                <FormControl>
                  <Select>
                    <SelectTrigger className="rounded-md border border-neutral-600 bg-neutral-800">
                      <SelectValue placeholder="Select Folder View" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="apple">Apple</SelectItem>
                      <SelectItem value="banana">Banana</SelectItem>
                      <SelectItem value="blueberry">Blueberry</SelectItem>
                      <SelectItem value="grapes">Grapes</SelectItem>
                      <SelectItem value="pineapple">Pineapple</SelectItem>
                    </SelectContent>
                  </Select>
                </FormControl>

                <FormMessage />
              </FormItem>
            )}
          />

          <div className="w-full space-y-4">
            <TypographyH4>Columns</TypographyH4>

            <FlexTable />
          </div>

          <FormMessage>{errors.root?.serverError?.type}</FormMessage>
        </form>
      </Form>
    </div>
  );
}

// Define Zod schema for column validation
const columnSchema = z.object({
  id: z.string(),
  name: z.string().min(1, { message: "Name is required" }),
  type: z.enum([
    "int8",
    "int4",
    "serial",
    "bigserial",
    "text",
    "timestamptz",
    "bytea",
  ]),
  defaultValue: z
    .string()
    .optional()
    .refine(
      (val, ctx) => {
        const type = ctx.parent.type;
        const disallowedTypes = ["serial", "bigserial", "text", "bytea"];
        if (
          disallowedTypes.includes(type) &&
          val !== undefined &&
          val !== null
        ) {
          return false;
        }
        return true;
      },
      { message: "This type cannot have a default value" },
    ),
  primary: z.boolean(),
});

// Define Zod type for the column based on schema
type Column = z.infer<typeof columnSchema>;

// Sample initial columns data
const initialColumns: Column[] = [
  { id: "1", name: "id", type: "int8", defaultValue: "NULL", primary: true },
  {
    id: "2",
    name: "created_at",
    type: "timestamptz",
    defaultValue: "now()",
    primary: false,
  },
];

interface SortableItemProps {
  column: Column;
}

function SortableItem({ column }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: column.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      className="flex items-center gap-4 rounded-md border border-neutral-600 p-2.5"
      style={style}
      {...attributes}
      {...listeners}
    >
      <div
        className="align-items flex cursor-pointer justify-center"
        style={{ width: "5%" }}
      >
        <Icon name="GripVertical" />
      </div>

      <div style={{ width: "25%" }}>
        <Input
          className="rounded-md border border-neutral-600 bg-neutral-800"
          value={column.name}
        />
      </div>

      <div style={{ width: "25%" }}>
        <Input
          className="rounded-md border border-neutral-600 bg-neutral-800"
          value={column.type}
        />
      </div>

      <div style={{ width: "25%" }}>
        <Input
          className="rounded-md border border-neutral-600 bg-neutral-800"
          value={column.defaultValue}
        />
      </div>

      <div className="align-items flex justify-center" style={{ width: "10%" }}>
        <Checkbox defaultChecked={column.primary} />
      </div>

      <div style={{ width: "10%", textAlign: "center" }}>
        <Icon name="Settings" />
      </div>
    </div>
  );
}

export function FlexTable() {
  const [columns, setColumns] = useState(initialColumns);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setColumns((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over?.id);
        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const addNewColumn = () => {
    const newColumn: Column = {
      id: Date.now().toString(), // Unique ID
      name: "column_name",
      type: "---",
      defaultValue: "NULL",
      primary: false,
    };
    setColumns((prev) => [...prev, newColumn]);
  };

  return (
    <DndContext
      collisionDetection={closestCenter}
      sensors={sensors}
      onDragEnd={handleDragEnd}
    >
      <div className="flex w-full flex-col gap-4">
        <div className="flex gap-4 px-4 text-sm">
          <div style={{ width: "5%" }} />
          <div style={{ width: "25%" }}>Name</div>
          <div style={{ width: "25%" }}>Type</div>
          <div style={{ width: "25%" }}>Default Value</div>
          <div style={{ width: "10%" }}>Primary</div>
          <div style={{ width: "10%" }} />
        </div>

        <SortableContext items={columns} strategy={verticalListSortingStrategy}>
          {columns.map((column) => (
            <SortableItem key={column.id} column={column} />
          ))}
        </SortableContext>

        <div className="mt-4">
          <button
            className="rounded-md border border-gray-600 px-4 py-2 text-white"
            onClick={addNewColumn}
            type="button"
          >
            Add Column
          </button>
        </div>
      </div>
    </DndContext>
  );
}
