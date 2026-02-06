import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { format, parseISO } from 'date-fns';
import { useContactsStore } from '@/stores/contactsStore';
import { useColors } from '@/hooks';
import { Button, Input, Badge, DatePicker } from '@/components/ui';
import { useT } from '@/i18n';
import { spacing, borderRadius, typography } from '@/constants/Theme';
import {
  GroupType,
  ToneType,
  NotificationLevel,
  GROUP_LABELS,
  TONE_LABELS,
  TONE_EMOJIS,
  NOTIFICATION_LABELS,
  AttributeCategory,
  ATTRIBUTE_LABELS,
} from '@/types/contact';

const GROUPS: GroupType[] = ['family', 'close_friend', 'friend', 'colleague', 'acquaintance'];
const TONES: ToneType[] = ['warm', 'funny', 'sarcastic', 'formal', 'roast'];
const NOTIFICATIONS: NotificationLevel[] = ['week', '3days', 'day_before', 'same_day', 'none'];
const ATTR_CATS: AttributeCategory[] = ['hobby', 'trait', 'memory', 'joke', 'nickname', 'other'];

export default function EditContactScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const router = useRouter();
  const contact = useContactsStore((s) => s.getContact(id!));
  const updateContact = useContactsStore((s) => s.updateContact);
  const t = useT();

  const [name, setName] = useState('');
  const [birthdayDate, setBirthdayDate] = useState<Date | null>(null);
  const [group, setGroup] = useState<GroupType>('friend');
  const [tone, setTone] = useState<ToneType>('warm');
  const [notif, setNotif] = useState<NotificationLevel>('day_before');
  const [attrCategory, setAttrCategory] = useState<AttributeCategory>('hobby');
  const [attrValue, setAttrValue] = useState('');
  const [attributes, setAttributes] = useState<{ id?: string; category: AttributeCategory; value: string }[]>([]);

  useEffect(() => {
    if (contact) {
      setName(contact.name);
      setBirthdayDate(parseISO(contact.birthday));
      setGroup(contact.groupType);
      setTone(contact.toneDefault);
      setNotif(contact.notificationLevel);
      setAttributes(
        contact.attributes.map((a) => ({ id: a.id, category: a.category, value: a.value }))
      );
    }
  }, [contact?.id]);

  if (!contact) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <Text style={{ color: colors.textSecondary }}>{t.contactDetail.notFound}</Text>
      </View>
    );
  }

  const addAttr = () => {
    if (!attrValue.trim()) return;
    setAttributes([...attributes, { category: attrCategory, value: attrValue.trim() }]);
    setAttrValue('');
  };

  const removeAttr = (idx: number) => {
    setAttributes(attributes.filter((_, i) => i !== idx));
  };

  const save = async () => {
    if (!name.trim()) {
      Alert.alert('', t.contactForm.errorName);
      return;
    }
    if (!birthdayDate) {
      Alert.alert('', t.contactForm.errorBirthday);
      return;
    }

    const birthday = format(birthdayDate, 'yyyy-MM-dd');

    await updateContact(contact.id, {
      name: name.trim(),
      birthday,
      groupType: group,
      toneDefault: tone,
      notificationLevel: notif,
      attributes: attributes.map((a) => ({
        id: a.id || Math.random().toString(36).slice(2),
        category: a.category,
        value: a.value,
      })),
    });

    router.back();
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: t.contactForm.editContact,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.primary,
          headerTitleStyle: { color: colors.text },
        }}
      />
      <ScrollView
        style={[styles.container, { backgroundColor: colors.background }]}
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <Input
          label={t.contactForm.name}
          placeholder={t.contactForm.namePlaceholder}
          value={name}
          onChangeText={setName}
          autoCapitalize="words"
          containerStyle={styles.field}
        />

        <DatePicker
          label={t.contactForm.birthday}
          value={birthdayDate}
          onChange={setBirthdayDate}
          placeholder={t.contactForm.birthdayPlaceholder}
          maximumDate={new Date()}
          minimumDate={new Date(1920, 0, 1)}
        />

        <Text style={[styles.label, { color: colors.text }]}>{t.contactForm.group}</Text>
        <View style={styles.chips}>
          {GROUPS.map((g) => (
            <TouchableOpacity
              key={g}
              onPress={() => setGroup(g)}
              style={[
                styles.chip,
                {
                  backgroundColor: group === g ? colors.primary : colors.backgroundSecondary,
                  borderColor: group === g ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: group === g ? '#FFF' : colors.text }]}>
                {GROUP_LABELS[g]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { color: colors.text }]}>{t.contactForm.defaultTone}</Text>
        <View style={styles.chips}>
          {TONES.map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => setTone(t)}
              style={[
                styles.chip,
                {
                  backgroundColor: tone === t ? colors.primary : colors.backgroundSecondary,
                  borderColor: tone === t ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: tone === t ? '#FFF' : colors.text }]}>
                {TONE_EMOJIS[t]} {TONE_LABELS[t]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { color: colors.text }]}>{t.contactForm.notifications}</Text>
        <View style={styles.chips}>
          {NOTIFICATIONS.map((n) => (
            <TouchableOpacity
              key={n}
              onPress={() => setNotif(n)}
              style={[
                styles.chip,
                {
                  backgroundColor: notif === n ? colors.primary : colors.backgroundSecondary,
                  borderColor: notif === n ? colors.primary : colors.border,
                },
              ]}
            >
              <Text style={[styles.chipText, { color: notif === n ? '#FFF' : colors.text }]}>
                {NOTIFICATION_LABELS[n]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={[styles.label, { color: colors.text }]}>{t.contactForm.attributes}</Text>
        {attributes.length > 0 && (
          <View style={styles.attrList}>
            {attributes.map((a, i) => (
              <View key={i} style={styles.attrRow}>
                <Badge label={ATTRIBUTE_LABELS[a.category]} variant="secondary" />
                <Text style={[styles.attrValue, { color: colors.text }]} numberOfLines={1}>
                  {a.value}
                </Text>
                <TouchableOpacity onPress={() => removeAttr(i)}>
                  <Ionicons name="close-circle" size={20} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <View style={styles.attrForm}>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.chips}>
              {ATTR_CATS.map((c) => (
                <TouchableOpacity
                  key={c}
                  onPress={() => setAttrCategory(c)}
                  style={[
                    styles.chipSm,
                    {
                      backgroundColor: attrCategory === c ? colors.secondary : colors.backgroundSecondary,
                      borderColor: attrCategory === c ? colors.secondary : colors.border,
                    },
                  ]}
                >
                  <Text
                    style={[
                      styles.chipSmText,
                      { color: attrCategory === c ? '#FFF' : colors.textSecondary },
                    ]}
                  >
                    {ATTRIBUTE_LABELS[c]}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
          <View style={styles.attrInputRow}>
            <Input
              placeholder={t.contactForm.attrPlaceholder}
              value={attrValue}
              onChangeText={setAttrValue}
              containerStyle={{ flex: 1 }}
              onSubmitEditing={addAttr}
              returnKeyType="done"
            />
            <TouchableOpacity
              style={[styles.attrAddBtn, { backgroundColor: colors.secondary }]}
              onPress={addAttr}
            >
              <Ionicons name="add" size={22} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        <Button
          title={t.contactForm.saveChanges}
          onPress={save}
          variant="primary"
          size="lg"
          fullWidth
          style={{ marginTop: spacing['2xl'] }}
        />
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.lg, paddingBottom: spacing['5xl'] },
  field: { marginBottom: spacing.lg },
  label: { ...typography.headline, marginBottom: spacing.sm, marginTop: spacing.lg },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  chip: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  chipText: { fontSize: 14, fontWeight: '600' },
  chipSm: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.full,
    borderWidth: 1,
  },
  chipSmText: { fontSize: 12, fontWeight: '600' },
  attrList: { marginTop: spacing.md, gap: spacing.sm },
  attrRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  attrValue: { flex: 1, fontSize: 15 },
  attrForm: { marginTop: spacing.md, gap: spacing.sm },
  attrInputRow: { flexDirection: 'row', gap: spacing.sm, alignItems: 'flex-end' },
  attrAddBtn: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
