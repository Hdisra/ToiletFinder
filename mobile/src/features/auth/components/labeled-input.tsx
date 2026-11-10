import { Ionicons } from "@react-native-vector-icons/ionicons";
import { useState } from "react";
import {
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";
import { colors } from "@/theme";

/** Input with its label inside the box. With `secure`, shows an eye to reveal the text. */
export function LabeledInput({
  label,
  secure,
  onFocus,
  onBlur,
  ...props
}: TextInputProps & { label: string; secure?: boolean }) {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  return (
    <View
      className={`rounded-2xl border bg-white px-4 pb-1.5 pt-2.5 ${
        focused ? "border-brand-500" : "border-brand-200"
      }`}
    >
      <Text className="text-xs text-muted">{label}</Text>
      <View className="flex-row items-center">
        <TextInput
          {...props}
          secureTextEntry={secure && !visible}
          placeholderTextColor={colors.muted}
          className="flex-1 py-1.5 text-base text-ink"
          onFocus={(e) => {
            setFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            onBlur?.(e);
          }}
        />
        {secure ? (
          <Pressable
            onPress={() => setVisible((v) => !v)}
            hitSlop={12}
            accessibilityLabel={
              visible ? "Ocultar contraseña" : "Mostrar contraseña"
            }
          >
            <Ionicons
              name={visible ? "eye-off" : "eye"}
              size={22}
              color={colors.muted}
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
