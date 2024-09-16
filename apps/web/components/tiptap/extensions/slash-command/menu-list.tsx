import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Icon } from '@/components/ui/icon';
import { cn } from '@/lib/utils';
import React, { useCallback, useEffect, useRef, useState } from 'react';

import { CommandButton } from './command-button';
import { type Command, type MenuListProps } from './types';

export const MenuList = React.forwardRef(
  ({ editor, command, items }: MenuListProps, ref) => {
    const scrollContainer = useRef<HTMLDivElement>(null);
    const activeItem = useRef<HTMLButtonElement>(null);
    const [selectedGroupIndex, setSelectedGroupIndex] = useState(0);
    const [selectedCommandIndex, setSelectedCommandIndex] = useState(0);

    // Anytime the groups change, i.e. the user types to narrow it down, we want to
    // reset the current selection to the first menu item
    useEffect(() => {
      setSelectedGroupIndex(0);
      setSelectedCommandIndex(0);
    }, [items]);

    const selectItem = useCallback(
      (groupIndex: number, commandIndex: number) => {
        const command2 = items[groupIndex]?.commands[commandIndex];
        if (command2) {
          command(command2); // Pass the Command object (command2) to the command function
        }
      },
      [command, items],
    );

    React.useImperativeHandle(ref, () => ({
      onKeyDown: ({ event }: { event: React.KeyboardEvent }) => {
        if (event.key === 'ArrowDown') {
          if (!items.length) {
            return false;
          }

          const commands = items[selectedGroupIndex]?.commands;
          if (commands) {
            let newCommandIndex = selectedCommandIndex + 1;
            let newGroupIndex = selectedGroupIndex;

            if (commands.length - 1 < newCommandIndex) {
              newCommandIndex = 0;
              newGroupIndex = selectedGroupIndex + 1;
            }

            if (items.length - 1 < newGroupIndex) {
              newGroupIndex = 0;
            }

            setSelectedCommandIndex(newCommandIndex);
            setSelectedGroupIndex(newGroupIndex);

            return true;
          }
        }

        if (event.key === 'ArrowUp') {
          if (!items.length) {
            return false;
          }

          let newCommandIndex = selectedCommandIndex - 1;
          let newGroupIndex = selectedGroupIndex;

          if (newCommandIndex < 0) {
            newGroupIndex = selectedGroupIndex - 1;
            // @ts-expect-error - Fix later
            newCommandIndex = items[newGroupIndex].commands.length - 1 || 0;
          }

          if (newGroupIndex < 0) {
            newGroupIndex = items.length - 1;
            // @ts-expect-error - Fix later
            newCommandIndex = items[newGroupIndex]?.commands.length - 1;
          }

          setSelectedCommandIndex(newCommandIndex);
          setSelectedGroupIndex(newGroupIndex);

          return true;
        }

        if (event.key === 'Enter') {
          if (
            !items.length ||
            selectedGroupIndex === -1 ||
            selectedCommandIndex === -1
          ) {
            return false;
          }

          selectItem(selectedGroupIndex, selectedCommandIndex);

          return true;
        }

        return false;
      },
    }));

    useEffect(() => {
      if (activeItem.current && scrollContainer.current) {
        const offsetTop = activeItem.current.offsetTop;
        const offsetHeight = activeItem.current.offsetHeight;

        scrollContainer.current.scrollTop = offsetTop - offsetHeight;
      }
    }, [selectedCommandIndex, selectedGroupIndex]);

    const createCommandClickHandler = useCallback(
      (groupIndex: number, commandIndex: number) => {
        return () => {
          selectItem(groupIndex, commandIndex);
        };
      },
      [selectItem],
    );

    if (!items.length) {
      return null;
    }

    return (
      <div
        ref={scrollContainer}
        className="text-black max-h-[min(80vh,24rem)] overflow-auto flex-wrap mb-8 p-2 bg-neutral-800"
      >
        <div className="grid grid-cols-1 gap-0.5">
          {items.map((group, groupIndex: number) => (
            <React.Fragment key={`${group.title}-wrapper`}>
              <div
                className="text-neutral-500 text-[0.65rem] col-[1/-1] mx-2 mt-4 font-semibold tracking-wider select-none uppercase first:mt-0.5"
                key={group.title}
              >
                {group.title}
              </div>

              <div>
                {group.commands.map(
                  (command: Command, commandIndex: number) => (
                    <div
                      key={command.label}
                      role="menuitem"
                      // Use the cn utility function to conditionally apply classes
                      // isActive={
                      //   selectedGroupIndex === groupIndex &&
                      //   selectedCommandIndex === commandIndex
                      // }
                      onClick={createCommandClickHandler(
                        groupIndex,
                        commandIndex,
                      )}
                      className={cn(
                        'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-white text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
                      )}
                    >
                      <Icon name={command.iconName} className="mr-1" />
                      {command.label}
                    </div>
                  ),
                )}
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  },
);

MenuList.displayName = 'MenuList';

export default MenuList;
