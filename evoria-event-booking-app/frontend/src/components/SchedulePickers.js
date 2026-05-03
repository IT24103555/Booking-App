import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const DEFAULT_THEME = {
  primary: '#EC168C',
  background: '#FFF7FC',
  surface: '#FFFFFF',
  text: '#111827',
  muted: '#7C7C8A',
  border: '#F0DDEB',
  soft: '#FFF2F8',
};

const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const pad2 = (value) => String(value).padStart(2, '0');

const parseDateValue = (value) => {
  const match = /^\d{4}-(\d{2})-(\d{2})$/.exec(String(value || '').trim());
  if (!match) return null;
  const [yearText, monthText, dayText] = String(value).trim().split('-');
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const date = new Date(year, month - 1, day);
  if (Number.isNaN(date.getTime())) return null;
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return date;
};

const formatDateValue = (date) => {
  const year = date.getFullYear();
  const month = pad2(date.getMonth() + 1);
  const day = pad2(date.getDate());
  return `${year}-${month}-${day}`;
};

const getMonthGrid = (monthDate) => {
  const firstDay = new Date(monthDate.getFullYear(), monthDate.getMonth(), 1);
  const startOffset = firstDay.getDay();
  const daysInMonth = new Date(monthDate.getFullYear(), monthDate.getMonth() + 1, 0).getDate();
  const cells = [];

  // Build a 6x7 calendar grid so the layout stays stable across months.
  for (let index = 0; index < startOffset; index += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push(new Date(monthDate.getFullYear(), monthDate.getMonth(), day));
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
};

const isSameDate = (left, right) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const startOfDay = (date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const buildTimeOptions = (intervalMinutes = 15) => {
  const options = [];
  for (let minutes = 0; minutes < 24 * 60; minutes += intervalMinutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    options.push(`${pad2(hours)}:${pad2(mins)}`);
  }
  return options;
};

export function PickerField({ label, value, placeholder, onPress, helperText, theme = DEFAULT_THEME }) {
  const hasValue = Boolean(String(value || '').trim());
  return (
    <View style={styles.pickerBlock}>
      <Text style={[styles.label, { color: theme.text }]}>{label}</Text>
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        style={[
          styles.pickerButton,
          { backgroundColor: theme.surface, borderColor: theme.border },
        ]}
      >
        <Text style={[styles.pickerValue, { color: hasValue ? theme.text : theme.muted }]}>
          {hasValue ? value : placeholder}
        </Text>
        <Text style={[styles.chevron, { color: theme.primary }]}>›</Text>
      </TouchableOpacity>
      {helperText ? <Text style={[styles.helperText, { color: theme.muted }]}>{helperText}</Text> : null}
    </View>
  );
}

export function DatePickerModal({
  visible,
  value,
  onClose,
  onSelect,
  theme = DEFAULT_THEME,
  title = 'Select Date',
  maxYearsAhead = 2,
}) {
  const today = useMemo(() => startOfDay(new Date()), []);
  const maxDate = useMemo(() => new Date(today.getFullYear() + maxYearsAhead, today.getMonth(), today.getDate()), [today, maxYearsAhead]);
  const [viewDate, setViewDate] = useState(today);

  useEffect(() => {
    if (!visible) return;
    const parsed = parseDateValue(value);
    setViewDate(parsed || today);
  }, [visible, value, today]);

  const monthTitle = `${viewDate.toLocaleString('default', { month: 'long' })} ${viewDate.getFullYear()}`;
  const grid = useMemo(() => getMonthGrid(viewDate), [viewDate]);

  const moveMonth = (offset) => {
    const next = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
    setViewDate(next);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.modalRoot, { backgroundColor: theme.background }]}>
        <View style={[styles.modalHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.closeText, { color: theme.text }]}>✕</Text>
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: theme.text }]}>{title}</Text>
          <View style={styles.closeSpacer} />
        </View>

        <View style={styles.monthHeader}>
          <TouchableOpacity style={[styles.monthNav, { borderColor: theme.border }]} onPress={() => moveMonth(-1)}>
            <Text style={[styles.monthNavText, { color: theme.primary }]}>‹</Text>
          </TouchableOpacity>
          <Text style={[styles.monthTitle, { color: theme.text }]}>{monthTitle}</Text>
          <TouchableOpacity style={[styles.monthNav, { borderColor: theme.border }]} onPress={() => moveMonth(1)}>
            <Text style={[styles.monthNavText, { color: theme.primary }]}>›</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.weekRow}>
          {WEEKDAYS.map((day) => (
            <Text key={day} style={[styles.weekday, { color: theme.muted }]}>{day}</Text>
          ))}
        </View>

        <View style={styles.calendarGrid}>
          {grid.map((date, index) => {
            if (!date) return <View key={`empty-${index}`} style={styles.dayCell} />;
            const selected = value && parseDateValue(value) && isSameDate(date, parseDateValue(value));
            const disabled = date < today || date > maxDate;
            return (
              <TouchableOpacity
                key={date.toISOString()}
                activeOpacity={0.85}
                disabled={disabled}
                onPress={() => onSelect(formatDateValue(date))}
                style={[
                  styles.dayCell,
                  selected && { backgroundColor: theme.primary, borderColor: theme.primary },
                  disabled && styles.dayDisabled,
                ]}
              >
                <Text style={[
                  styles.dayText,
                  { color: selected ? '#FFFFFF' : disabled ? theme.muted : theme.text },
                ]}>
                  {date.getDate()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.footerHint, { color: theme.muted }]}>Tap a date to choose it. Past dates stay disabled.</Text>
      </SafeAreaView>
    </Modal>
  );
}

export function TimePickerModal({
  visible,
  value,
  onClose,
  onSelect,
  theme = DEFAULT_THEME,
  title = 'Select Time',
  intervalMinutes = 15,
}) {
  const options = useMemo(() => buildTimeOptions(intervalMinutes), [intervalMinutes]);

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <SafeAreaView style={[styles.modalRoot, { backgroundColor: theme.background }]}>
        <View style={[styles.modalHeader, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
          <TouchableOpacity onPress={onClose}>
            <Text style={[styles.closeText, { color: theme.text }]}>✕</Text>
          </TouchableOpacity>
          <Text style={[styles.modalTitle, { color: theme.text }]}>{title}</Text>
          <View style={styles.closeSpacer} />
        </View>

        <FlatList
          data={options}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.timeList}
          renderItem={({ item }) => {
            const selected = item === value;
            return (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => onSelect(item)}
                style={[
                  styles.timeRow,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                  selected && { backgroundColor: theme.soft, borderColor: theme.primary },
                ]}
              >
                <Text style={[styles.timeText, { color: theme.text, fontWeight: selected ? '900' : '700' }]}>{item}</Text>
                {selected ? <Text style={[styles.selectedMark, { color: theme.primary }]}>✓</Text> : null}
              </TouchableOpacity>
            );
          }}
        />

        <Text style={[styles.footerHint, { color: theme.muted }]}>Choose a 24-hour time in 15-minute steps.</Text>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  pickerBlock: { marginBottom: 14 },
  label: { marginBottom: 8, fontWeight: '700', fontSize: 13 },
  pickerButton: {
    minHeight: 50,
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerValue: { fontSize: 15, fontWeight: '600', flex: 1, paddingRight: 10 },
  chevron: { fontSize: 22, fontWeight: '900' },
  helperText: { marginTop: 8, fontSize: 12, lineHeight: 16 },
  modalRoot: { flex: 1 },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  closeText: { fontSize: 22, fontWeight: '900', width: 30, textAlign: 'center' },
  closeSpacer: { width: 30 },
  modalTitle: { fontSize: 17, fontWeight: '900' },
  monthHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 16, paddingBottom: 8 },
  monthNav: { width: 42, height: 42, borderRadius: 14, borderWidth: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fff' },
  monthNavText: { fontSize: 24, fontWeight: '900' },
  monthTitle: { fontSize: 18, fontWeight: '900' },
  weekRow: { flexDirection: 'row', paddingHorizontal: 12, marginBottom: 8 },
  weekday: { flex: 1, textAlign: 'center', fontSize: 12, fontWeight: '800' },
  calendarGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
  dayCell: {
    width: '14.2857%',
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  dayDisabled: { opacity: 0.35 },
  dayText: { fontSize: 14, fontWeight: '800' },
  footerHint: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12, fontSize: 12, lineHeight: 16 },
  timeList: { padding: 12, paddingBottom: 24 },
  timeRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  timeText: { fontSize: 15 },
  selectedMark: { fontSize: 18, fontWeight: '900' },
});