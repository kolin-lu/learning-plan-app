import { ScrollView, Text, View, TouchableOpacity, TextInput, Alert, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { usePlanContext } from "@/lib/plan-context";
import { calculateTaskProgress } from "@/lib/storage";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import * as Haptics from "expo-haptics";
import { MaterialIcons } from "@expo/vector-icons";

export default function TaskDetailScreen() {
  const router = useRouter();
  const colors = useColors();
  const { planId, taskId } = useLocalSearchParams();
  const { getTaskById, updateTask, removeTask, addSubtask, toggleSubtask, removeSubtask } = usePlanContext();

  const [task, setTask] = useState<any>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<'high' | 'medium' | 'low'>('medium');
  const [dueDate, setDueDate] = useState("");
  const [newSubtaskName, setNewSubtaskName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (planId && taskId && typeof planId === 'string' && typeof taskId === 'string') {
      const foundTask = getTaskById(planId, taskId);
      if (foundTask) {
        setTask(foundTask);
        setName(foundTask.name);
        setDescription(foundTask.description);
        setPriority(foundTask.priority);
        setDueDate(foundTask.dueDate || "");
      }
    }
  }, [planId, taskId, getTaskById]);

  if (!task || !planId || !taskId || typeof planId !== 'string' || typeof taskId !== 'string') {
    return (
      <ScreenContainer className="justify-center items-center">
        <Text style={{ color: colors.foreground }}>加载中...</Text>
      </ScreenContainer>
    );
  }

  const taskProgress = calculateTaskProgress(task);

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert("错误", "请输入任务名称");
      return;
    }

    setLoading(true);
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await updateTask(planId, {
        ...task,
        name: name.trim(),
        description: description.trim(),
        priority,
        dueDate,
      });
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
    Alert.alert(
      "删除任务",
      "确定要删除这个任务吗？此操作无法撤销。",
      [
        { text: "取消", onPress: () => {} },
        {
          text: "删除",
          onPress: async () => {
            try {
              setLoading(true);
              await removeTask(planId, taskId);
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

  const handleAddSubtask = async () => {
    if (!newSubtaskName.trim()) {
      Alert.alert("错误", "请输入子任务名称");
      return;
    }

    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      await addSubtask(planId, taskId, newSubtaskName.trim());
      setNewSubtaskName("");
      const updatedTask = getTaskById(planId, taskId);
      if (updatedTask) setTask(updatedTask);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert("错误", "添加失败，请重试");
    }
  };

  const handleToggleSubtask = async (subtaskId: string) => {
    try {
      await toggleSubtask(planId, taskId, subtaskId);
      const updatedTask = getTaskById(planId, taskId);
      if (updatedTask) setTask(updatedTask);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      Alert.alert("错误", "操作失败，请重试");
    }
  };

  const handleDeleteSubtask = (subtaskId: string) => {
    Alert.alert(
      "删除子任务",
      "确定要删除这个子任务吗？",
      [
        { text: "取消", onPress: () => {} },
        {
          text: "删除",
          onPress: async () => {
            try {
              await removeSubtask(planId, taskId, subtaskId);
              const updatedTask = getTaskById(planId, taskId);
              if (updatedTask) setTask(updatedTask);
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

  const renderSubtaskItem = ({ item }: { item: any }) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.surface,
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <TouchableOpacity
        onPress={() => handleToggleSubtask(item.id)}
        style={{
          width: 20,
          height: 20,
          borderRadius: 4,
          backgroundColor: item.completed ? colors.primary : colors.border,
          justifyContent: 'center',
          alignItems: 'center',
          marginRight: 10,
        }}
      >
        {item.completed && <MaterialIcons name="check" size={14} color="#fff" />}
      </TouchableOpacity>

      <Text
        style={{
          flex: 1,
          fontSize: 13,
          color: colors.foreground,
          textDecorationLine: item.completed ? 'line-through' : 'none',
        }}
      >
        {item.name}
      </Text>

      <TouchableOpacity
        onPress={() => handleDeleteSubtask(item.id)}
        style={{ padding: 4 }}
      >
        <MaterialIcons name="close" size={18} color={colors.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={colors.foreground} />
          </TouchableOpacity>
          <Text style={{ fontSize: 18, fontWeight: '600', color: colors.foreground }}>
            编辑任务
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
              minHeight: 80,
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
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 8 }}>
            截止日期
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
            value={dueDate}
            onChangeText={setDueDate}
          />
        </View>

        {/* Subtasks Section */}
        <View style={{ marginBottom: 20 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground }}>
              子任务 ({task.subtasks.length})
            </Text>
            {task.subtasks.length > 0 && (
              <Text style={{ fontSize: 12, color: colors.primary, fontWeight: '600' }}>
                {taskProgress.percentage}%
              </Text>
            )}
          </View>

          {task.subtasks.length > 0 && (
            <View style={{ marginBottom: 12 }}>
              <View
                style={{
                  height: 6,
                  backgroundColor: colors.border,
                  borderRadius: 3,
                  overflow: 'hidden',
                  marginBottom: 8,
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

          <FlatList
            data={task.subtasks}
            renderItem={renderSubtaskItem}
            keyExtractor={(item) => item.id}
            scrollEnabled={false}
            style={{ marginBottom: 12 }}
          />

          {/* Add Subtask Input */}
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput
              style={{
                flex: 1,
                borderWidth: 1,
                borderColor: colors.border,
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 10,
                fontSize: 13,
                color: colors.foreground,
                backgroundColor: colors.surface,
              }}
              placeholder="输入新的子任务"
              placeholderTextColor={colors.muted}
              value={newSubtaskName}
              onChangeText={setNewSubtaskName}
            />
            <TouchableOpacity
              onPress={handleAddSubtask}
              style={{
                backgroundColor: colors.primary,
                paddingHorizontal: 12,
                borderRadius: 8,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              activeOpacity={0.7}
            >
              <MaterialIcons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
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
              删除任务
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
