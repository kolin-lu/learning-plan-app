import { ScrollView, Text, View, FlatList } from "react-native";
import { ScreenContainer } from "@/components/screen-container";
import { usePlanContext } from "@/lib/plan-context";
import { getStatistics } from "@/lib/storage";
import { useColors } from "@/hooks/use-colors";
import { useState, useEffect } from "react";
import { MaterialIcons } from "@expo/vector-icons";

export default function StatisticsScreen() {
  const colors = useColors();
  const { plans } = usePlanContext();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    const loadStats = async () => {
      const data = await getStatistics();
      setStats(data);
    };
    loadStats();
  }, [plans]);

  if (!stats) {
    return (
      <ScreenContainer className="justify-center items-center">
        <Text style={{ color: colors.foreground }}>加载中...</Text>
      </ScreenContainer>
    );
  }

  const recentCompletedTasks = plans
    .flatMap(plan =>
      plan.tasks
        .filter(task => task.completed && task.completedAt)
        .map(task => ({
          ...task,
          planName: plan.name,
        }))
    )
    .sort((a, b) => new Date(b.completedAt!).getTime() - new Date(a.completedAt!).getTime())
    .slice(0, 10);

  const renderCompletedTaskItem = ({ item }: { item: any }) => (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 8,
        padding: 12,
        marginBottom: 8,
        borderLeftWidth: 4,
        borderLeftColor: colors.success,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: 10 }}>
        <MaterialIcons name="check-circle" size={20} color={colors.success} />
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 13, fontWeight: '600', color: colors.foreground, marginBottom: 2 }}>
            {item.name}
          </Text>
          <Text style={{ fontSize: 11, color: colors.muted }}>
            {item.planName}
          </Text>
          {item.completedAt && (
            <Text style={{ fontSize: 10, color: colors.muted, marginTop: 4 }}>
              {new Date(item.completedAt).toLocaleDateString('zh-CN')}
            </Text>
          )}
        </View>
      </View>
    </View>
  );

  const StatCard = ({ title, value, icon, color }: any) => (
    <View
      style={{
        backgroundColor: colors.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <View>
          <Text style={{ fontSize: 12, color: colors.muted, marginBottom: 4 }}>
            {title}
          </Text>
          <Text style={{ fontSize: 28, fontWeight: 'bold', color }}>
            {value}
          </Text>
        </View>
        <MaterialIcons name={icon} size={40} color={color} style={{ opacity: 0.3 }} />
      </View>
    </View>
  );

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16, paddingBottom: 100 }}>
        {/* Header */}
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: colors.foreground, marginBottom: 4 }}>
          学习统计
        </Text>
        <Text style={{ fontSize: 13, color: colors.muted, marginBottom: 20 }}>
          查看您的学习进度和成就
        </Text>

        {/* Overall Progress */}
        <View
          style={{
            backgroundColor: colors.primary,
            borderRadius: 16,
            padding: 20,
            marginBottom: 20,
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 120,
              height: 120,
              borderRadius: 60,
              backgroundColor: 'rgba(255,255,255,0.2)',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 48, fontWeight: 'bold', color: '#fff' }}>
              {stats.completionRate}%
            </Text>
          </View>
          <Text style={{ fontSize: 14, color: '#fff', marginBottom: 4 }}>
            总体完成度
          </Text>
          <Text style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)' }}>
            {stats.completedTasks} / {stats.totalTasks} 任务已完成
          </Text>
        </View>

        {/* Statistics Cards */}
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground, marginBottom: 12 }}>
          任务统计
        </Text>

        <StatCard
          title="总计划数"
          value={stats.totalPlans}
          icon="assignment"
          color={colors.primary}
        />

        <StatCard
          title="总任务数"
          value={stats.totalTasks}
          icon="task-alt"
          color={colors.warning}
        />

        <StatCard
          title="已完成任务"
          value={stats.completedTasks}
          icon="check-circle"
          color={colors.success}
        />

        {/* Priority Distribution */}
        <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground, marginBottom: 12 }}>
          优先级分布
        </Text>

        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: 12,
            padding: 16,
            marginBottom: 20,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <View style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontSize: 13, color: colors.foreground, fontWeight: '600' }}>
                高优先级
              </Text>
              <Text style={{ fontSize: 13, color: colors.error, fontWeight: '600' }}>
                {stats.highPriorityTasks}
              </Text>
            </View>
            <View
              style={{
                height: 8,
                backgroundColor: colors.border,
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  height: '100%',
                  width: `${stats.totalTasks === 0 ? 0 : (stats.highPriorityTasks / stats.totalTasks) * 100}%`,
                  backgroundColor: colors.error,
                }}
              />
            </View>
          </View>

          <View style={{ marginBottom: 12 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontSize: 13, color: colors.foreground, fontWeight: '600' }}>
                中优先级
              </Text>
              <Text style={{ fontSize: 13, color: colors.warning, fontWeight: '600' }}>
                {stats.mediumPriorityTasks}
              </Text>
            </View>
            <View
              style={{
                height: 8,
                backgroundColor: colors.border,
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  height: '100%',
                  width: `${stats.totalTasks === 0 ? 0 : (stats.mediumPriorityTasks / stats.totalTasks) * 100}%`,
                  backgroundColor: colors.warning,
                }}
              />
            </View>
          </View>

          <View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 }}>
              <Text style={{ fontSize: 13, color: colors.foreground, fontWeight: '600' }}>
                低优先级
              </Text>
              <Text style={{ fontSize: 13, color: colors.success, fontWeight: '600' }}>
                {stats.lowPriorityTasks}
              </Text>
            </View>
            <View
              style={{
                height: 8,
                backgroundColor: colors.border,
                borderRadius: 4,
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  height: '100%',
                  width: `${stats.totalTasks === 0 ? 0 : (stats.lowPriorityTasks / stats.totalTasks) * 100}%`,
                  backgroundColor: colors.success,
                }}
              />
            </View>
          </View>
        </View>

        {/* Recent Completed Tasks */}
        {recentCompletedTasks.length > 0 && (
          <>
            <Text style={{ fontSize: 16, fontWeight: '600', color: colors.foreground, marginBottom: 12 }}>
              最近完成的任务
            </Text>
            <FlatList
              data={recentCompletedTasks}
              renderItem={renderCompletedTaskItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </>
        )}

        {recentCompletedTasks.length === 0 && (
          <View style={{ alignItems: 'center', justifyContent: 'center', paddingVertical: 40 }}>
            <MaterialIcons name="celebration" size={48} color={colors.border} style={{ marginBottom: 12 }} />
            <Text style={{ fontSize: 14, fontWeight: '600', color: colors.foreground, marginBottom: 4 }}>
              还没有完成任务
            </Text>
            <Text style={{ fontSize: 12, color: colors.muted, textAlign: 'center' }}>
              完成一些任务后，它们会显示在这里
            </Text>
          </View>
        )}
      </ScrollView>
    </ScreenContainer>
  );
}
