import { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Pressable,
  Text,
  View,
} from "react-native";
import { TextField } from "@/components/text-field";
import { PrimaryButton } from "@/components/ui";
import { colors } from "@/theme";
import { errorMessage } from "@/utils/errors";
import { useMyRating, useSaveRating } from "../hooks";

/** The 1-10 score buttons, in two rows of five. */
const SCORE_ROWS = [
  [1, 2, 3, 4, 5],
  [6, 7, 8, 9, 10],
];

/** Rate a bathroom, or change the rating this phone already gave it. */
export function RateBathroom({
  bathroomId,
  onRated,
}: {
  bathroomId: number;
  onRated: () => void;
}) {
  // `mine` = the rating this user already gave (if any); `save` = the request that stores it.
  const mine = useMyRating(bathroomId);
  const save = useSaveRating(bathroomId);
  // What the user changed so far; anything untouched shows the saved rating.
  const [draft, setDraft] = useState<{ score?: number; comment?: string }>({});

  if (mine.isPending) {
    return (
      <View className="items-center rounded-3xl bg-brand-50 p-8">
        <ActivityIndicator color={colors.brand[500]} />
      </View>
    );
  }

  // Values shown: the user's edits, or the saved rating when untouched.
  const saved = mine.data ?? null;
  const score = draft.score ?? saved?.score;
  const comment = draft.comment ?? saved?.comment ?? "";
  const changed =
    !saved || score !== saved.score || comment.trim() !== (saved.comment ?? "");

  /** Sends the score and comment (an empty comment removes it), then thanks the user. */
  const submit = () => {
    if (!score || save.isPending) return;
    save.mutate(
      { score, comment: comment.trim() || undefined },
      {
        onSuccess: () => {
          setDraft({});
          Keyboard.dismiss();
          onRated();
        },
      },
    );
  };

  return (
    <View className="gap-3 rounded-3xl bg-brand-50 p-4">
      <View>
        <Text className="text-base font-bold text-ink">
          {saved ? "Tu calificación" : "¿Ya estuviste aquí? Califícalo"}
        </Text>
        {saved ? (
          <Text className="text-sm text-muted">
            Puedes cambiarla cuando quieras.
          </Text>
        ) : null}
      </View>

      {SCORE_ROWS.map((row) => (
        <View key={row[0]} className="flex-row justify-between">
          {row.map((value) => (
            <Pressable
              key={value}
              onPress={() => setDraft((d) => ({ ...d, score: value }))}
              className={`h-14 w-14 items-center justify-center rounded-full ${
                score === value ? "bg-brand-500" : "bg-white"
              }`}
            >
              <Text
                className={`text-lg font-semibold ${
                  score === value ? "text-white" : "text-ink"
                }`}
              >
                {value}
              </Text>
            </Pressable>
          ))}
        </View>
      ))}

      <TextField
        value={comment}
        onChangeText={(text) => setDraft((d) => ({ ...d, comment: text }))}
        placeholder="Agrega un comentario (opcional)"
        maxLength={500}
        multiline
      />

      <PrimaryButton
        label={saved ? "Actualizar calificación" : "Enviar calificación"}
        onPress={submit}
        disabled={!score || !changed}
        loading={save.isPending}
      />
      {save.isError ? (
        <Text className="text-center font-medium text-danger">
          {errorMessage(save.error)}
        </Text>
      ) : null}
    </View>
  );
}
