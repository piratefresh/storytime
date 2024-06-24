import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/icon";
import { Toolbar } from "@/components/ui/toolbar";
import { useCallback } from "react";

const FONT_SIZES = [
  { label: "Smaller", value: "12px" },
  { label: "Small", value: "14px" },
  { label: "Medium", value: "" },
  { label: "Large", value: "18px" },
  { label: "Extra Large", value: "24px" },
];

export type FontSizePickerProps = {
  container: HTMLDivElement | null;
  onChange: (value: string) => void; // eslint-disable-line no-unused-vars
  value: string;
};

export const FontSizePicker = ({
  container,
  onChange,
  value,
}: FontSizePickerProps) => {
  const currentValue = FONT_SIZES.find((size) => size.value === value);
  const currentSizeLabel = currentValue?.label.split(" ")[0] || "Medium";

  const selectSize = useCallback(
    (size: string) => () => onChange(size),
    [onChange]
  );

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Toolbar.Button active={!!currentValue?.value}>
          {currentSizeLabel}
          <Icon name="ChevronDown" className="w-2 h-2" />
        </Toolbar.Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent portalProps={{ container }}>
        {FONT_SIZES.map((size) => (
          <DropdownMenuItem
            className="flex flex-col gap-1 px-2 py-4"
            isActive={value === size.value}
            onClick={selectSize(size.value)}
            key={`${size.label}_${size.value}`}
          >
            <span style={{ fontSize: size.value }}>{size.label}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
