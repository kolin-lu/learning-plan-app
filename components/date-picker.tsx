import { useState } from 'react';
import { View, Text, Pressable, TextInput, Modal, Platform } from 'react-native';
import { useColors } from '@/hooks/use-colors';
import { MaterialIcons } from '@expo/vector-icons';

interface DatePickerProps {
  label: string;
  value: string;
  onChange: (date: string) => void;
  minimumDate?: Date;
}

export function DatePicker({ label, value, onChange, minimumDate }: DatePickerProps) {
  const colors = useColors();
  const [showModal, setShowModal] = useState(false);
  const [inputValue, setInputValue] = useState(value);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const getDefaultDate = () => {
    return formatDate(new Date(Date.now() + 24 * 60 * 60 * 1000));
  };

  const validateDate = (dateStr: string): boolean => {
    if (!dateStr) return true;
    
    const regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(dateStr)) return false;

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return false;

    if (minimumDate && date < minimumDate) return false;

    return true;
  };

  const handlePress = () => {
    if (Platform.OS === 'web') {
      const input = document.createElement('input');
      input.type = 'date';
      input.value = value || getDefaultDate();
      if (minimumDate) {
        input.min = formatDate(minimumDate);
      }
      input.onchange = (e: any) => {
        if (e.target.value) {
          onChange(e.target.value);
        }
      };
      input.click();
    } else {
      setInputValue(value || getDefaultDate());
      setShowModal(true);
    }
  };

  const handleConfirm = () => {
    if (validateDate(inputValue)) {
      onChange(inputValue);
      setShowModal(false);
    }
  };

  const handleCancel = () => {
    setInputValue(value);
    setShowModal(false);
  };

  const getQuickDate = (daysFromNow: number) => {
    const date = new Date();
    date.setDate(date.getDate() + daysFromNow);
    return formatDate(date);
  };

  return (
    <View style={{ marginBottom: 20 }}>
      <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>
        {label}
      </Text>
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => ({
          borderWidth: 1,
          borderColor: colors.border,
          borderRadius: 8,
          paddingHorizontal: 12,
          paddingVertical: 12,
          backgroundColor: colors.surface,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          opacity: pressed ? 0.7 : 1,
        })}
      >
        <Text style={{ fontSize: 14, color: value ? colors.foreground : colors.muted }}>
          {value || getDefaultDate()}
        </Text>
        <MaterialIcons name="calendar-today" size={20} color={colors.muted} />
      </Pressable>

      {/* 原生移动端模态框 */}
      <Modal
        visible={showModal}
        transparent
        animationType="slide"
        onRequestClose={handleCancel}
      >
        <Pressable
          style={{
            flex: 1,
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            justifyContent: 'flex-end',
          }}
          onPress={handleCancel}
        >
          <Pressable
            style={{
              backgroundColor: colors.background,
              borderTopLeftRadius: 16,
              borderTopRightRadius: 16,
              padding: 20,
              paddingBottom: 40,
            }}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={{ fontSize: 18, fontWeight: '600', color: colors.foreground, marginBottom: 16 }}>
              选择日期
            </Text>

            {/* 快捷日期选择 */}
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
              {[
                { label: '明天', days: 1 },
                { label: '后天', days: 2 },
                { label: '3天后', days: 3 },
                { label: '一周后', days: 7 },
                { label: '两周后', days: 14 },
                { label: '一个月后', days: 30 },
              ].map((item) => (
                <Pressable
                  key={item.days}
                  onPress={() => setInputValue(getQuickDate(item.days))}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 6,
                    backgroundColor: colors.surface,
                    borderWidth: 1,
                    borderColor: colors.border,
                  }}
                >
                  <Text style={{ fontSize: 12, color: colors.foreground }}>
                    {item.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* 日期输入框 */}
            <TextInput
              style={{
                borderWidth: 1,
                borderColor: validateDate(inputValue) ? colors.border : colors.error,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 12,
                fontSize: 16,
                color: colors.foreground,
                backgroundColor: colors.surface,
                marginBottom: 8,
              }}
              placeholder="YYYY-MM-DD"
              placeholderTextColor={colors.muted}
              value={inputValue}
              onChangeText={setInputValue}
              keyboardType="numbers-and-punctuation"
            />

            {!validateDate(inputValue) && inputValue && (
              <Text style={{ fontSize: 12, color: colors.error, marginBottom: 12 }}>
                请输入有效的日期格式 (YYYY-MM-DD)
              </Text>
            )}

            {/* 操作按钮 */}
            <View style={{ flexDirection: 'row', gap: 12, marginTop: 8 }}>
              <Pressable
                onPress={handleCancel}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: colors.surface,
                  borderWidth: 1,
                  borderColor: colors.border,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground }}>
                  取消
                </Text>
              </Pressable>

              <Pressable
                onPress={handleConfirm}
                disabled={!validateDate(inputValue)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 8,
                  backgroundColor: validateDate(inputValue) ? colors.primary : colors.border,
                  alignItems: 'center',
                }}
              >
                <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
                  确定
                </Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
