import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';

import { styles } from '../theme/styles';
import type { RecoveryPeriod } from '../types';
import { formatDateHy, today } from '../utils/date';
import { getType } from '../utils/period';

export function DailyCheckInModal({
  periods,
  visible,
  onKeep,
  onRelapse,
  onClose,
}: {
  periods: RecoveryPeriod[];
  visible: boolean;
  onKeep: (id: string) => void;
  onRelapse: (id: string) => void;
  onClose: () => void;
}) {
  const [answeredIds, setAnsweredIds] = useState<string[]>([]);
  const checkDate = today();
  const activePeriod = periods.find((period) => !answeredIds.includes(period.id));

  useEffect(() => {
    if (visible) {
      setAnsweredIds([]);
    }
  }, [visible]);

  const answer = (id: string, didKeep: boolean) => {
    if (didKeep) {
      onKeep(id);
    } else {
      onRelapse(id);
    }

    const nextAnsweredIds = [...answeredIds, id];
    setAnsweredIds(nextAnsweredIds);

    if (nextAnsweredIds.length >= periods.length) {
      onClose();
    }
  };

  if (!activePeriod) {
    return null;
  }

  return (
    <Modal animationType="slide" transparent visible={visible}>
      <View style={styles.modalBackdrop}>
        <View style={styles.modalCard}>
          <Text style={styles.modalTitle}>Ինչպե՞ս անցավ այսօրը</Text>
          <Text style={styles.modalText}>
            Նշիր առանց դատելու. սա օգնում է հասկանալ ընթացքը եւ շարունակել:
          </Text>
          <Text style={styles.modalDate}>{formatDateHy(checkDate)}</Text>

          <View style={styles.checkRow}>
            <Text style={styles.checkTitle}>{activePeriod.title}</Text>
            <Text style={styles.checkSubtitle}>
              {getType(activePeriod.addictionTypeId).label} / {activePeriod.subtype ?? 'Ընդհանուր'}
            </Text>
            <Text style={styles.checkCounter}>
              {answeredIds.length + 1} / {periods.length}
            </Text>
            <View style={styles.checkActions}>
              <Pressable onPress={() => answer(activePeriod.id, true)} style={styles.keepButton}>
                <Ionicons name="checkmark-circle" size={18} color="#ffffff" />
                <Text style={styles.keepButtonText}>Մաքուր օր էր</Text>
              </Pressable>
              <Pressable onPress={() => answer(activePeriod.id, false)} style={styles.missButton}>
                <Ionicons name="heart-outline" size={18} color="#be123c" />
                <Text style={styles.missButtonText}>Դժվար օր էր</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
