import { useState } from 'react';
import { View, Text, Pressable, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
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
  const [showPicker, setShowPicker] = useState(false);

  const dateValue = value ? new Date(value) : new Date(Date.now() + 24 * 60 * 60 * 1000);

  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }

    if (selectedDate) {
      onChange(formatDate(selectedDate));
    }
  };

  const handlePress = () => {
    if (Platform.OS === 'web') {
      // Web平台使用原生input type="date"
      const input = document.createElement('input');
      input.type = 'date';
      input.value = value || formatDate(new Date(Date.now() + 24 * 60 * 60 * 1000));
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
      setShowPicker(true);
    }
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
          {value || formatDate(new Date(Date.now() + 24 * 60 * 60 * 1000))}
        </Text>
        <MaterialIcons name="calendar-today" size={20} color={colors.muted} />
      </Pressable>

      {showPicker && Platform.OS !== 'web' && (
        <View>
          <DateTimePicker
            value={dateValue}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleDateChange}
            minimumDate={minimumDate}
          />
          {Platform.OS === 'ios' && (
            <Pressable
              onPress={() => setShowPicker(false)}
              style={{
                backgroundColor: colors.primary,
                paddingVertical: 10,
                borderRadius: 8,
                alignItems: 'center',
                marginTop: 10,
              }}
            >
              <Text style={{ fontSize: 14, fontWeight: '600', color: '#fff' }}>
                确定
              </Text>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );
}
