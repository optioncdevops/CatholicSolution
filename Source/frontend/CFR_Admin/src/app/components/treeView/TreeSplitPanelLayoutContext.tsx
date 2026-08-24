import { createContext, useContext, type ReactNode } from "react";

export interface TreeSplitPanelLayoutContextValue {
  /** True when rendered inside a fill-height TreeViewSplitPanel workspace. */
  fillHeight: boolean;
}

const TreeSplitPanelLayoutContext = createContext<TreeSplitPanelLayoutContextValue>({
  fillHeight: false,
});

export function TreeSplitPanelLayoutProvider({
  fillHeight,
  children,
}: {
  fillHeight: boolean;
  children: ReactNode;
}) {
  return (
    <TreeSplitPanelLayoutContext.Provider value={{ fillHeight }}>
      {children}
    </TreeSplitPanelLayoutContext.Provider>
  );
}

export function useTreeSplitPanelLayout(): TreeSplitPanelLayoutContextValue {
  return useContext(TreeSplitPanelLayoutContext);
}
