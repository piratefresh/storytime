"use client";

import * as React from "react";
import { CaretSortIcon, CheckIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Genres } from "@/app/constants/genres";

const genreOptions = Object.values(Genres).map((genre) => ({
  value: genre,
  label: genre,
}));

export function GenreCombobox({
  onChange,
  value,
}: {
  onChange: (value: string) => void;
  value: string;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {value
            ? genreOptions.find((genre) => genre.value === value)?.label
            : "Select genre..."}
          <CaretSortIcon className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search genre..." className="h-9" />
          <CommandEmpty>No genre found.</CommandEmpty>
          <CommandGroup>
            {genreOptions.map((genre) => (
              <CommandItem
                key={genre.value}
                value={genre.value}
                onSelect={(currentValue) => {
                  onChange(currentValue === value ? "" : currentValue);
                  setOpen(false);
                }}
              >
                {genre.label}
                <CheckIcon
                  className={cn(
                    "ml-auto h-4 w-4",
                    value === genre.value ? "opacity-100" : "opacity-0"
                  )}
                />
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
