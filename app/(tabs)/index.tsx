import { ScrollView, Text, View, TouchableOpacity, RefreshControl, FlatList, ActivityIndicator } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { usePlanContext } from "@/lib/plan-context";
import { calculatePlanProgress } from "@/lib/storage";
import { useRouter } from "expo-router";
import { useColors } from "@/hooks/use-colors";
import { useState } from "react";
import * as Haptics from "expo-haptics";
import { MaterialIcons } from "@expo/vector-icons";

export default function HomeScreen() {
  const router = useRouter();
  const colors = useColors();
  const { plans, loading, loadPlans } = usePlanContext();
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadPlans();
    setRefreshing(false);
  };

  const handleCreatePlan = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push("/plan-form");
  };

  const handlePlanPress = (planId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/plan-detail/${planId}`);
  };

  const renderPlanCard = ({ item }: { item: any }) => {
    const progress = calculatePlanProgress(item);
    const priorityColor = item.priority === 'high' ? colors.error : item.priority === 'medium' ? colors.warning : colors.success;

    return (
      <TouchableOpacity
        onPress={() => handlePlanPress(item.id)}
        style={{
          backgroundColor: colors.surface,
          borderRadius: 12,
          padding: 16,
          marginBottom: 12,
          borderWidth: 1,
          borderColor: colors.border,
        }}
        activeOpacity={0.7}
      >
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground, marginBottom: 4 }}>
              {item.name}
            </Text>
            <Text style={{ fontSize: 13, color: colors.muted }} numberOfLines={2}>
              {item.description}
            </Text>
          </View>
          <View
            style={{
              backgroundColor: priorityColor,
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 6,
              marginLeft: 8,
            }}
          >
            <Text style={{ fontSize: 11, color: '#fff', fontWeight: '600' }}>
              {item.priority === 'high' ? '高' : item.priority === 'medium' ? '中' : '低'}
            </Text>
          </View>
        </View>

        {/* Progress Bar */}
        <View style={{ marginBottom: 8 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 }}>
            <Text style={{ fontSize: 12, color: colors.muted }}>
              进度
            </Text>
            <Text style={{ fontSize: 12, color: colors.muted, fontWeight: '600' }}>
              {progress.completed}/{progress.total}
            </Text>
          </View>
          <View
            style={{
              height: 6,
              backgroundColor: colors.border,
              borderRadius: 3,
              overflow: 'hidden',
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
        </View>

        <Text style={{ fontSize: 12, color: colors.muted }}>
          {item.tasks.length} 个任务
        </Text>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <ScreenContainer className="justify-center items-center">
        <ActivityIndicator size="large" color={colors.primary} />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer className="flex-1">
      <FlatList
        data={plans}
        renderItem={renderPlanCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 }}
        ListHeaderComponent={
          <View style={{ marginBottom: 20 }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: colors.foreground, marginBottom: 4 }}>
              学习计划
            </Text>
            <Text style={{ fontSize: 14, color: colors.muted }}>
              {plans.length} 个计划
            </Text>
          </View>
        }
        ListEmptyComponent={
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 60 }}>
            <MaterialIcons name="assignment" size={48} color={colors.border} style={{ marginBottom: 12 }} />
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground, marginBottom: 4 }}>
              还没有学习计划
            </Text>
            <Text style={{ fontSize: 13, color: colors.muted, textAlign: 'center' }}>
              点击下方按钮创建第一个学习计划
            </Text>
          </View>
        }
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={colors.primary} />
        }
        scrollEnabled={true}
      />

      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={handleCreatePlan}
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
