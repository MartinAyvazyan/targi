import { Pressable, Text, View } from 'react-native';

import { styles } from '../theme/styles';
import type { UndoState } from '../types';

export function UndoSnackbar({
  undo,
  bottom,
}: {
  undo?: UndoState;
  bottom: number;
}) {
  if (!undo) {
    return null;
  }

  return (
    <View style={[styles.undoBar, { bottom }]}>
      <Text numberOfLines={2} style={styles.undoText}>{undo.message}</Text>
      <Pressable onPress={undo.onUndo} style={styles.undoButton}>
        <Text style={styles.undoButtonText}>{undo.actionLabel}</Text>
      </Pressable>
    </View>
  );
}
