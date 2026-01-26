import { ScrollView, Text, View, TouchableOpacity, FlatList, ActivityIndicator, Alert } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { usePlanContext } from "@/lib/plan-context";
import { calculatePlanProgress, calculateTaskProgress } from "@/lib/storage";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import * as Haptics from "expo-haptics";
import { MaterialIcons } from "@expo/vector-icons";

export default function PlanDetailScreen() {
  const router = useRouter();
  const colors = useColors();
  const { id } = useLocalSearchParams();
  const { getPlanById, toggleTask, removeTask } = usePlanContext();
  const [plan, setPlan] = useState<any>(null);

  useEffect(() => {
    if (id && typeof id === 'string') {
      const foundPlan = getPlanById(id);
      setPlan(foundPlan);
    }
  }, [id, getPlanById]);

  if (!plan) {
    return (
      <ScreenContainer className="justify-center items-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  const progress = calculatePlanProgress(plan);

  const handleTaskPress = (taskId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/task-detail/${plan.id}/${taskId}`);
  };

  const handleAddTask = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/task-form/${plan.id}`);
  };

  const handleEditPlan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/plan-form?planId=${plan.id}`);
  };

  const handleToggleTask = async (taskId: string) => {
    try {
      await toggleTask(plan.id, taskId);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert("错误", "操作失败，请重试");
    }
  };

  const handleDeleteTask = (taskId: string) => {
    Alert.alert(
      "删除任务",
      "确定要删除这个任务吗？",
      [
        { text: "取消", onPress: () => {} },
        {
          text: "删除",
          onPress: async () => {
            try {
              await removeTask(plan.id, taskId);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
            } catch (error) {
              Alert.alert("错误", "删除失败，请重试");
            }
          },
          style: "destructive",
        },
      ]
    );
  };

  const renderTaskItem = ({ item }: { item: any }) => {
    const taskProgress = calculateTaskProgress(item);
    const priorityColor = item.priority === 'high' ? colors.error : item.priority === 'medium' ? colors.warning : colors.success;

    return (
      <View
        style={{
          backgroundColor: colors.surface,
          borderRadius: 10,
          padding: 12,
          marginBottom: 10,
          borderWidth: 1,
          borderColor: colors.border,
          opacity: item.completed ? 0.6 : 1,
        }}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
          <TouchableOpacity
            onPress={() => handleToggleTask(item.id)}
            style={{
              width: 24,
              height: 24,
              borderRadius: 6,
              backgroundColor: item.completed ? colors.primary : colors.border,
              justifyContent: 'center',
              alignItems: 'center',
              marginRight: 10,
            }}
          >
            {item.completed && <MaterialIcons name="check" size={16} color="#fff" />}
          </TouchableOpacity>

          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 14,
                fontWeight: '600',
                color: colors.foreground,
                textDecorationLine: item.completed ? 'line-through' : 'none',
                marginBottom: 4,
              }}
            >
              {item.name}
            </Text>
            {item.description && (
              <Text style={{ fontSize: 12, color: colors.muted }} numberOfLines={2}>
                {item.description}
              </Text>
            )}
          </View>

          <View
            style={{
              backgroundColor: priorityColor,
              paddingHorizontal: 6,
              paddingVertical: 2,
              borderRadius: 4,
              marginLeft: 8,
            }}
          >
            <Text style={{ fontSize: 10, color: '#fff', fontWeight: '600' }}>
              {item.priority === 'high' ? '高' : item.priority === 'medium' ? '中' : '低'}
            </Text>
          </View>
        </View>

        {/* Subtask Progress */}
        {item.subtasks.length > 0 && (
          <View style={{ marginBottom: 8, marginLeft: 34 }}>
            <View
              style={{
                height: 4,
                backgroundColor: colors.border,
                borderRadius: 2,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  height: '100%',
                  width: `${taskProgress.percentage}%`,
                  backgroundColor: colors.primary,
                }}
              />
            </View>
          </View>
        )}

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8, marginLeft: 34 }}>
          <TouchableOpacity
            onPress={() => handleTaskPress(item.id)}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              backgroundColor: colors.primary,
              borderRadius: 6,
            }}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 12, color: '#fff', fontWeight: '600' }}>
              编辑
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => handleDeleteTask(item.id)}
            style={{
              paddingHorizontal: 10,
              paddingVertical: 6,
              backgroundColor: colors.error,
              borderRadius: 6,
            }}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 12, color: '#fff', fontWeight: '600' }}>
              删除
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <ScreenContainer className="flex-1 bg-background">
      <FlatList
        data={plan.tasks}
        renderItem={renderTaskItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 }}
        ListHeaderComponent={
          <View style={{ marginBottom: 20 }}>
            {/* Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <TouchableOpacity onPress={() => router.back()}>
                <MaterialIcons name="arrow-back" size={24} color={colors.foreground} />
              </TouchableOpacity>
              <TouchableOpacity onPress={handleEditPlan}>
                <MaterialIcons name="edit" size={24} color={colors.foreground} />
              </TouchableOpacity>
            </View>

            {/* Plan Info */}
            <Text style={{ fontSize: 24, fontWeight: 'bold', color: colors.foreground, marginBottom: 4 }}>
              {plan.name}
            </Text>
            {plan.description && (
              <Text style={{ fontSize: 13, color: colors.muted, marginBottom: 12 }}>
                {plan.description}
              </Text>
            )}

            {/* Progress */}
            <View style={{ backgroundColor: colors.surface, borderRadius: 10, padding: 12, marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.foreground }}>
                  完成进度
                </Text>
                <Text style={{ fontSize: 13, fontWeight: '600', color: colors.primary }}>
                  {progress.percentage}%
                </Text>
              </View>
              <View
                style={{
                  height: 8,
                  backgroundColor: colors.border,
                  borderRadius: 4,
                  overflow: 'hidden',
                  marginBottom: 8,
                }}
              >
                <View
                  style={{
                    height: '100%',
                    width: `${progress.percentage}%`,
                    backgroundColor: colors.primary,
                  }}
                />
              </View>
              <Text style={{ fontSize: 12, color: colors.muted }}>
                {progress.completed} / {progress.total} 任务已完成
              </Text>
            </View>

            {/* Tasks Header */}
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground }}>
                任务列表
              </Text>
              <TouchableOpacity
                onPress={handleAddTask}
                style={{
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  backgroundColor: colors.primary,
                  borderRadius: 6,
                }}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 12, color: '#fff', fontWeight: '600' }}>
                  + 添加任务
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
            <MaterialIcons name="task-alt" size={48} color={colors.border} style={{ marginBottom: 12 }} />
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 4 }}>
              还没有任务
            </Text>
            <Text style={{ fontSize: 12, color: colors.muted, textAlign: 'center' }}>
              点击上方"添加任务"按钮创建第一个任务
            </Text>
          </View>
        }
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={handleAddTask}
        style={{
          position: 'absolute',
          bottom: 80,
          right: 16,
          width: 56,
          height: 56,
          borderRadius: 28,
          backgroundColor: colors.primary,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        }}
        activeOpacity={0.8}
      >
        <MaterialIcons name="add" size={28} color="#fff" />
      </TouchableOpacity>
    </ScreenContainer>
  );
}
