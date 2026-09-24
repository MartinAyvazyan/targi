import { Pressable, Text, View } from 'react-native';
import Ionicons from '@expo/vector-icons/Ionicons';

import { styles } from '../theme/styles';
import type { UndoState } from '../types';

export function UndoSnackbar({
  undo,
  bottom,
  onDismiss,
}: {
  undo?: UndoState;
  bottom: number;
  onDismiss: () => void;
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
      <Pressable accessibilityLabel="Close" hitSlop={8} onPress={onDismiss} style={styles.undoCloseButton}>
        <Ionicons name="close" size={18} color="#ffffff" />
      </Pressable>
    </View>
  );
}
