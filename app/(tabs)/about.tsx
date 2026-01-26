import { ScrollView, Text, View, Pressable, Linking } from 'react-native';
import { ScreenContainer } from '@/components/screen-container';
import { useColors } from '@/hooks/use-colors';
import { cn } from '@/lib/utils';
import * as Constants from 'expo-constants';

const APP_VERSION = '1.0.0';
const DEVELOPER_NAME = 'Kolin Lu';
const DEVELOPER_BLOG = 'https://linluxi.com';

export default function AboutScreen() {
  const colors = useColors();

  const handleOpenLink = async (url: string) => {
    try {
      const canOpen = await Linking.canOpenURL(url);
      if (canOpen) {
        await Linking.openURL(url);
      }
    } catch (error) {
      console.error('Failed to open link:', error);
    }
  };

  const LinkButton = ({ label, url }: { label: string; url: string }) => (
    <Pressable
      onPress={() => handleOpenLink(url)}
      style={({ pressed }) => [
        {
          opacity: pressed ? 0.7 : 1,
        },
      ]}
    >
      <View className="flex-row items-center justify-between py-3 px-4 border-b border-border">
        <Text className="text-base text-foreground">{label}</Text>
        <Text className="text-sm text-muted">→</Text>
      </View>
    </Pressable>
  );

  return (
    <ScreenContainer className="flex-1 bg-background">
      <ScrollView contentContainerStyle={{ flexGrow: 1 }} className="flex-1">
        <View className="flex-1 gap-6 pb-8">
          {/* 应用信息头 */}
          <View className="items-center gap-4 pt-8 pb-6">
            <View
              className="w-20 h-20 rounded-3xl bg-primary items-center justify-center"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-4xl">📚</Text>
            </View>
            <View className="items-center gap-1">
              <Text className="text-2xl font-bold text-foreground">学习计划工具</Text>
              <Text className="text-sm text-muted">版本 {APP_VERSION}</Text>
            </View>
          </View>

          {/* 应用描述 */}
          <View className="mx-4 gap-2">
            <Text className="text-sm text-muted leading-relaxed">
              学习计划工具帮助您设置学习目标、拆分任务并跟踪完成情况。通过清晰的进度展示和任务提醒，让您的学习更加高效有序。
            </Text>
          </View>

          {/* 功能部分 */}
          <View className="mx-4 gap-2">
            <Text className="text-lg font-semibold text-foreground mb-2">主要功能</Text>
            <View className="gap-2">
              {[
                '📋 创建和管理学习计划',
                '✅ 拆分任务和子任务',
                '📊 实时进度跟踪',
                '🔔 任务提醒通知',
                '📈 学习统计分析',
              ].map((feature, index) => (
                <View key={index} className="flex-row items-center gap-3 py-2">
                  <Text className="text-base">{feature.split(' ')[0]}</Text>
                  <Text className="text-sm text-foreground flex-1">
                    {feature.substring(2)}
                  </Text>
                </View>
              ))}
            </View>
          </View>

          {/* 开发者信息 */}
          <View
            className="mx-4 rounded-lg p-4 gap-3"
            style={{ backgroundColor: colors.surface }}
          >
            <Text className="text-lg font-semibold text-foreground">开发者</Text>
            <View className="gap-2">
              <View className="flex-row items-center justify-between">
                <Text className="text-sm text-muted">开发者：</Text>
                <Text className="text-sm font-medium text-foreground">{DEVELOPER_NAME}</Text>
              </View>
              <Pressable
                onPress={() => handleOpenLink(DEVELOPER_BLOG)}
                style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}
              >
                <View className="flex-row items-center justify-between">
                  <Text className="text-sm text-muted">个人博客：</Text>
                  <Text className="text-sm font-medium text-primary">{DEVELOPER_BLOG}</Text>
                </View>
              </Pressable>
            </View>
          </View>

          {/* 应用链接 */}
          <View className="mx-4 rounded-lg overflow-hidden border border-border">
            <LinkButton label="开发者博客" url={DEVELOPER_BLOG} />
          </View>

          {/* 版本和构建信息 */}
          <View className="mx-4 gap-2 pb-4">
            <Text className="text-xs text-muted text-center">
              应用版本 {APP_VERSION}
            </Text>
            {Constants.default.expoConfig?.version && (
              <Text className="text-xs text-muted text-center">
                构建版本 {Constants.default.expoConfig.version}
              </Text>
            )}
            <Text className="text-xs text-muted text-center mt-2">
              © 2026 学习计划工具. All rights reserved.
            </Text>
          </View>
        </View>
      </ScrollView>
    </ScreenContainer>
  );
}
