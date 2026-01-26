import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { usePlanContext } from "@/lib/plan-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import * as Haptics from "expo-haptics";
import { MaterialIcons } from "@expo/vector-icons";

export default function PlanFormScreen() {
  const router = useRouter();
  const colors = useColors();
  const { plans, createPlan, updatePlan, removePlan } = usePlanContext();
  const { planId } = useLocalSearchParams();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [targetDate, setTargetDate] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (planId && typeof planId === 'string') {
      const plan = plans.find(p => p.id === planId);
      if (plan) {
        setName(plan.name);
        setDescription(plan.description);
        setPriority(plan.priority);
        setTargetDate(plan.targetDate || "");
      }
    }
  }, [planId, plans]);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("错误", "请输入计划名称");
      return;
    }

    setLoading(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

      if (planId && typeof planId === 'string') {
        const plan = plans.find(p => p.id === planId);
        if (plan) {
          await updatePlan({
            ...plan,
            name: name.trim(),
            description: description.trim(),
            priority,
            targetDate,
          });
        }
      } else {
        await createPlan(name.trim(), description.trim(), priority, targetDate);
      }

      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      router.back();
    } catch (error) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert("错误", "保存失败，请重试");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    if (!planId || typeof planId !== 'string') return;

    Alert.alert(
      "删除计划",
      "确定要删除这个计划吗？此操作无法撤销。",
      [
        { text: "取消", onPress: () => {} },
        {
          text: "删除",
          onPress: async () => {
            try {
              setLoading(true);
              await removePlan(planId);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              router.back();
            } catch (error) {
              Alert.alert("错误", "删除失败，请重试");
            } finally {
              setLoading(false);
            }
          },
          style: "destructive",
        },
      ]
    );
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
            {planId ? "编辑计划" : "创建计划"}
          </Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Name Input */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>
            计划名称 *
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
            placeholder="输入计划名称"
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
            placeholder="输入计划描述"
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

        {/* Target Date Input */}
        <View style={{ marginBottom: 30 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>
            目标完成日期
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
            placeholder="YYYY-MM-DD"
            placeholderTextColor={colors.muted}
            value={targetDate}
            onChangeText={setTargetDate}
          />
        </View>

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

          {planId && (
            <TouchableOpacity
              onPress={handleDelete}
              disabled={loading}
              style={{
                backgroundColor: colors.error,
                paddingVertical: 12,
                borderRadius: 8,
                alignItems: 'center',
                opacity: loading ? 0.6 : 1,
              }}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#fff' }}>
                删除计划
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
