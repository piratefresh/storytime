import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/icon";
import { Toolbar } from "@/components/ui/toolbar";
import { useCallback } from "react";

const FONT_FAMILY_GROUPS = [
  {
    label: "Sans Serif",
    options: [
      { label: "Inter", value: "" },
      { label: "Arial", value: "Arial" },
      { label: "Helvetica", value: "Helvetica" },
    ],
  },
  {
    label: "Serif",
    options: [
      { label: "Times New Roman", value: "Times" },
      { label: "Garamond", value: "Garamond" },
      { label: "Georgia", value: "Georgia" },
    ],
  },
  {
    label: "Monospace",
    options: [
      { label: "Courier", value: "Courier" },
      { label: "Courier New", value: "Courier New" },
    ],
  },
];

const FONT_FAMILIES = FONT_FAMILY_GROUPS.flatMap((group) => [
  group.options,
]).flat();

export type FontFamilyPickerProps = {
  container: HTMLDivElement | null;
  onChange: (value: string) => void; // eslint-disable-line no-unused-vars
  value: string;
};

export const FontFamilyPicker = ({
  container,
  onChange,
  value,
}: FontFamilyPickerProps) => {
  const currentValue = FONT_FAMILIES.find((size) => size.value === value);
  const currentFontLabel = currentValue?.label.split(" ")[0] || "Inter";

  const selectFont = useCallback(
    (font: string) => () => onChange(font),
    [onChange]
  );

  return (
    <DropdownMenu modal={false}>
      <DropdownMenuTrigger asChild>
        <Toolbar.Button active={!!currentValue?.value}>
          {currentFontLabel}
          <Icon name="ChevronDown" className="w-2 h-2" />
        </Toolbar.Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent portalProps={{ container }}>
        {FONT_FAMILY_GROUPS.map((group) => (
          <div
            className="mt-2.5 first:mt-0 gap-0.5 flex flex-col"
            key={group.label}
          >
            <DropdownMenuLabel>{group.label}</DropdownMenuLabel>
            {group.options.map((font) => (
              <DropdownMenuItem
                className="flex flex-col gap-1 px-2 py-4"
                isActive={value === font.value}
                onClick={selectFont(font.value)}
                key={`${font.label}_${font.value}`}
              >
                <span style={{ fontFamily: font.value }}>{font.label}</span>
              </DropdownMenuItem>
            ))}
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
