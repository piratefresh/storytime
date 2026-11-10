import { type icons } from "lucide-react";
import { useMemo } from "react";
import { Toolbar } from "@/components/ui/toolbar";
import { Icon } from "@/components/ui/icon";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export interface ContentTypePickerOption {
  label: string;
  id: string;
  type: "option";
  disabled: () => boolean;
  isActive: () => boolean;
  onClick: () => void;
  icon: keyof typeof icons;
}

export interface ContentTypePickerCategory {
  label: string;
  id: string;
  type: "category";
}

export type ContentPickerOptions = (ContentTypePickerOption | ContentTypePickerCategory)[];

export interface ContentTypePickerProps {
  options: ContentPickerOptions;
  container: HTMLDivElement | null;
}

const isOption = (
  option: ContentTypePickerOption | ContentTypePickerCategory
): option is ContentTypePickerOption => option.type === "option";

export function ContentTypePicker({
  options,
  container,
}: ContentTypePickerProps) {
  const activeItem = useMemo(
    () =>
      options.find((option) => option.type === "option" && option.isActive()),
    [options]
  );

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Toolbar.Button
          active={activeItem?.id !== "paragraph" && Boolean(activeItem?.type)}
        >
          <Icon
            name={
              activeItem?.type === "option" ? activeItem.icon : "Pilcrow"
            }
          />
          <Icon name="ChevronDown" className="w-2 h-2" />
        </Toolbar.Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="flex flex-col gap-1 px-2 py-4"
        portalProps={{ container }}
      >
        {options.map((option) => {
          if (isOption(option)) {
            return (
              <DropdownMenuItem
                className="flex gap-1 px-2 py-4"
                key={option.id}
                onClick={option.onClick}
                isActive={option.isActive()}
              >
                <Icon name={option.icon} className="w-4 h-4 mr-1" />
                {option.label}
              </DropdownMenuItem>
            );
          }
          return (
            <div className="first:mt-0" key={option.id}>
              <DropdownMenuLabel key={option.id}>
                {option.label}
              </DropdownMenuLabel>
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
