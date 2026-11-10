import { Icon } from "@/components/ui/icon";
import { Toolbar } from "@/components/ui/toolbar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { LinkEditorPanel } from "./panels/link-editor-panel";

export interface EditLinkPopoverProps {
  onSetLink: (link: string, openInNewTab?: boolean) => void;
}

export function EditLinkPopover({ onSetLink }: EditLinkPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Toolbar.Button tooltip="Set Link">
          <Icon name="Link" />
        </Toolbar.Button>
      </PopoverTrigger>
      <PopoverContent>
        <LinkEditorPanel onSetLink={onSetLink} />
      </PopoverContent>
    </Popover>
  );
}
