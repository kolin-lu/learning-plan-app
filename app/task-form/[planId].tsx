import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { usePlanContext } from "@/lib/plan-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import * as Haptics from "expo-haptics";
import { MaterialIcons } from "@expo/vector-icons";
import { DatePicker } from "@/components/date-picker";

export default function TaskFormScreen() {
  const router = useRouter();
  const colors = useColors();
  const { planId } = useLocalSearchParams();
  const { addTask } = usePlanContext();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [dueDate, setDueDate] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("错误", "请输入任务名称");
      return;
    }

    if (!planId || typeof planId !== 'string') {
      Alert.alert("错误", "计划ID无效");
      return;
    }

    setLoading(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await addTask(planId, name.trim(), description.trim(), priority, dueDate);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("错误", "保存失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const PriorityButton = ({ value, label }: { value: 'high' | 'medium' | 'low'; label: string }) => {
    const isSelected = priority === value;
    const bgColor = value === 'high' ? colors.error : value === 'medium' ? colors.warning : colors.success;

    return (
      <TouchableOpacity
        onPress={() => setPriority(value)}
        style={{
          flex: 1,
          paddingVertical: 10,
          paddingHorizontal: 12,
          borderRadius: 8,
          backgroundColor: isSelected ? bgColor : colors.border,
          marginHorizontal: 4,
        }}
        activeOpacity={0.7}
      >
        <Text
          style={{
            fontSize: 13,
            fontWeight: '600',
            color: isSelected ? '#fff' : colors.muted,
            textAlign: 'center',
          }}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: '600', color: colors.foreground }}>
            创建任务
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Name Input */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>
            任务名称 *
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              fontSize: 14,
              color: colors.foreground,
              backgroundColor: colors.surface,
            }}
            placeholder="输入任务名称"
            placeholderTextColor={colors.muted}
            value={name}
            onChangeText={setName}
          />
        </View>

        {/* Description Input */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>
            描述
          </Text>
          <TextInput
            style={{
              borderWidth: 1,
              borderColor: colors.border,
              borderRadius: 8,
              paddingHorizontal: 12,
              paddingVertical: 10,
              fontSize: 14,
              color: colors.foreground,
              backgroundColor: colors.surface,
              minHeight: 100,
              textAlignVertical: 'top',
            }}
            placeholder="输入任务描述"
            placeholderTextColor={colors.muted}
            value={description}
            onChangeText={setDescription}
            multiline
          />
        </View>

        {/* Priority Selection */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>
            优先级
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <PriorityButton value="high" label="高" />
            <PriorityButton value="medium" label="中" />
            <PriorityButton value="low" label="低" />
          </View>
        </View>

        {/* Due Date Input */}
        <DatePicker
          label="截止日期"
          value={dueDate}
          onChange={setDueDate}
          minimumDate={new Date()}
        />

        {/* Action Buttons */}
        <View style={{ gap: 12 }}>
          <TouchableOpacity
            onPress={handleSave}
            disabled={loading}
            style={{
              backgroundColor: colors.primary,
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: 'center',
              opacity: loading ? 0.6 : 1,
            }}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
              {loading ? "保存中..." : "保存"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => router.back()}
            disabled={loading}
            style={{
              backgroundColor: colors.surface,
              borderWidth: 1,
              borderColor: colors.border,
              paddingVertical: 12,
              borderRadius: 8,
              alignItems: 'center',
            }}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground }}>
              取消
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
