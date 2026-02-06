import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Platform,
  Modal,
} from 'react-native';
import DateTimePicker, {
  DateTimePickerEvent,
} from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { ru } from 'date-fns/locale';
import { Ionicons } from '@expo/vector-icons';
import { useColors } from '@/hooks';
import { spacing, borderRadius, typography } from '@/constants/Theme';

interface DatePickerProps {
  label?: string;
  value: Date | null;
  onChange: (date: Date) => void;
  placeholder?: string;
  maximumDate?: Date;
  minimumDate?: Date;
}

export function DatePicker({
  label,
  value,
  onChange,
  placeholder = 'Выбери дату',
  maximumDate,
  minimumDate,
}: DatePickerProps) {
  const colors = useColors();
  const [show, setShow] = useState(false);
  const [tempDate, setTempDate] = useState(value || new Date(2000, 0, 1));

  const handleChange = (_event: DateTimePickerEvent, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShow(false);
      if (selectedDate) {
        onChange(selectedDate);
      }
    } else {
      if (selectedDate) {
        setTempDate(selectedDate);
      }
    }
  };

  const confirmIOS = () => {
    onChange(tempDate);
    setShow(false);
  };

  const openPicker = () => {
    setTempDate(value || new Date(2000, 0, 1));
    setShow(true);
  };

  return (
    <View style={styles.container}>
      {label && (
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
      )}

      <TouchableOpacity
        style={[
          styles.button,
          {
            backgroundColor: colors.backgroundSecondary,
            borderColor: colors.border,
          },
        ]}
        onPress={openPicker}
        activeOpacity={0.7}
      >
        <Ionicons
          name="calendar-outline"
          size={20}
          color={value ? colors.primary : colors.textTertiary}
        />
        <Text
          style={[
            styles.buttonText,
            { color: value ? colors.text : colors.textTertiary },
          ]}
        >
          {value
            ? format(value, 'd MMMM yyyy', { locale: ru })
            : placeholder}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textTertiary} />
      </TouchableOpacity>

      {/* Android: inline picker */}
      {show && Platform.OS === 'android' && (
        <DateTimePicker
          value={tempDate}
          mode="date"
          display="spinner"
          onChange={handleChange}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          locale="ru"
        />
      )}

      {/* iOS: modal picker */}
      {show && Platform.OS === 'ios' && (
        <Modal transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View
              style={[styles.modalContent, { backgroundColor: colors.card }]}
            >
              <View style={styles.modalHeader}>
                <TouchableOpacity onPress={() => setShow(false)}>
                  <Text style={[styles.modalAction, { color: colors.textSecondary }]}>
                    Отмена
                  </Text>
                </TouchableOpacity>
                <Text style={[typography.headline, { color: colors.text }]}>
                  Дата рождения
                </Text>
                <TouchableOpacity onPress={confirmIOS}>
                  <Text style={[styles.modalAction, { color: colors.primary, fontWeight: '700' }]}>
                    Готово
                  </Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker
                value={tempDate}
                mode="date"
                display="spinner"
                onChange={handleChange}
                maximumDate={maximumDate}
                minimumDate={minimumDate}
                locale="ru"
                style={{ height: 200 }}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    ...typography.headline,
    marginBottom: spacing.sm,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md + 2,
    borderRadius: borderRadius.md,
    borderWidth: 1,
    gap: spacing.sm,
  },
  buttonText: {
    flex: 1,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  modalContent: {
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  modalAction: {
    fontSize: 16,
  },
});
