import { Ionicons } from "@react-native-vector-icons/ionicons";
import { Modal, Text, View } from "react-native";
import { colors } from "@/theme";

/** Centered message over a dimmed screen. The parent decides when to hide it. */
export function MessageDialog({
  visible,
  title,
}: {
  visible: boolean;
  title: string;
}) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
    >
      <View className="flex-1 items-center justify-center bg-black/30 px-10">
        <View className="w-full items-center gap-3 rounded-3xl bg-white px-6 py-8 shadow-lg">
          <Ionicons name="checkmark-circle" size={56} color={colors.free} />
          <Text className="text-center text-xl font-bold text-ink">
            {title}
          </Text>
        </View>
      </View>
    </Modal>
  );
}
