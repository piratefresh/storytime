import { useContext, useEffect, useMemo, useState } from "react";

import { Editor, useEditor } from "@tiptap/react";
import { useSidebar } from "@/hooks/useSidebar";

export const useBlockEditor = () => {
  const leftSidebar = useSidebar();

  const editor = useEditor()
};
