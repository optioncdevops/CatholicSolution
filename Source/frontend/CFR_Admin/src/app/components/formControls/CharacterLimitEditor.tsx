import React, { useState } from "react";
import {
  themeFieldTextareaBaseClass,
  themeFieldWrapperClass,
  themeLabelClass,
} from "@designSystem/theme/styles/componentStyle";
import { cn } from "@app/utilities/cn";

interface CharacterLimitEditorProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  maxLength?: number;
  onValueChange?: (value: string) => void;
}

export const CharacterLimitEditor = ({
  label = "Fixed Character Editor",
  maxLength = 200,
  placeholder = "Type something...",
  onValueChange,
  ...props
}: CharacterLimitEditorProps) => {
  const [text, setText] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (newValue.length <= maxLength) {
      setText(newValue);
      onValueChange?.(newValue);
      props.onChange?.(e);
    }
  };

  return (
    <div className={themeFieldWrapperClass}>
      <div className="flex items-center justify-between">
        <label className={themeLabelClass}>{label}</label>
        <span className="text-xs text-foreground-muted">
          {text.length} / {maxLength}
        </span>
      </div>
      <textarea
        rows={4}
        className={cn(
          themeFieldTextareaBaseClass,
          "border-border focus:border-primary-600 focus:ring-2 focus:ring-primary-600/20 dark:focus:border-primary-400 dark:focus:ring-primary-400/25",
        )}
        placeholder={placeholder}
        value={text}
        onChange={handleChange}
        maxLength={maxLength}
        {...props}
      />
    </div>
  );
};
