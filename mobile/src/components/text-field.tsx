import { BottomSheetTextInput } from "@gorhom/bottom-sheet";
import type { ComponentProps } from "react";
import { colors } from "@/theme";

/** Text input for use inside bottom sheets (keeps the keyboard from covering it). */
export function TextField(props: ComponentProps<typeof BottomSheetTextInput>) {
  return (
    <BottomSheetTextInput
      placeholderTextColor={colors.muted}
      {...props}
      style={{
        // White with a light border so the box stands out on the pale cards it sits in.
        backgroundColor: colors.white,
        borderWidth: 1,
        borderColor: colors.brand[200],
        borderRadius: 14,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 16,
        color: colors.ink,
        textAlignVertical: props.multiline ? "top" : "center",
        // A comfortable box for comments; past the maximum the text scrolls inside it.
        ...(props.multiline ? { minHeight: 120, maxHeight: 200 } : null),
      }}
    />
  );
}
