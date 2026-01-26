import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * 数据类型定义
 */

export interface Subtask {
  id: string;
  taskId: string;
  name: string;
  completed: boolean;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  id: string;
  planId: string;
  name: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  completed: boolean;
  completedAt?: string;
  subtasks: Subtask[];
  reminder?: 'none' | '5min' | '15min' | '30min' | '1hour' | '1day';
  createdAt: string;
  updatedAt: string;
}

export interface Plan {
  id: string;
  name: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  targetDate?: string;
  createdAt: string;
  updatedAt: string;
  tasks: Task[];
}

/**
 * 存储管理工具函数
 */

const PLANS_KEY = '@learning_plan_app:plans';

/**
 * 获取所有计划
 */
export async function getAllPlans(): Promise<Plan[]> {
  try {
    const data = await AsyncStorage.getItem(PLANS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Failed to get plans:', error);
    return [];
  }
}

/**
 * 获取单个计划
 */
export async function getPlanById(planId: string): Promise<Plan | null> {
  try {
    const plans = await getAllPlans();
    return plans.find(p => p.id === planId) || null;
  } catch (error) {
    console.error('Failed to get plan:', error);
    return null;
  }
}

/**
 * 保存计划
 */
export async function savePlan(plan: Plan): Promise<void> {
  try {
    const plans = await getAllPlans();
    const index = plans.findIndex(p => p.id === plan.id);
    
    if (index >= 0) {
      plans[index] = plan;
    } else {
      plans.push(plan);
    }
    
    await AsyncStorage.setItem(PLANS_KEY, JSON.stringify(plans));
  } catch (error) {
    console.error('Failed to save plan:', error);
    throw error;
  }
}

/**
 * 删除计划
 */
export async function deletePlan(planId: string): Promise<void> {
  try {
    const plans = await getAllPlans();
    const filtered = plans.filter(p => p.id !== planId);
    await AsyncStorage.setItem(PLANS_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Failed to delete plan:', error);
    throw error;
  }
}

/**
 * 创建新计划
 */
export function createPlan(
  name: string,
  description: string,
  priority: 'high' | 'medium' | 'low' = 'medium',
  targetDate?: string
): Plan {
  const now = new Date().toISOString();
  return {
    id: Date.now().toString(),
    name,
    description,
    priority,
    targetDate,
    createdAt: now,
    updatedAt: now,
    tasks: [],
  };
}

/**
 * 创建新任务
 */
export function createTask(
  planId: string,
  name: string,
  description: string,
  priority: 'high' | 'medium' | 'low' = 'medium',
  dueDate?: string
): Task {
  const now = new Date().toISOString();
  return {
    id: Date.now().toString(),
    planId,
    name,
    description,
    priority,
    dueDate,
    completed: false,
    subtasks: [],
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * 创建新子任务
 */
export function createSubtask(
  taskId: string,
  name: string
): Subtask {
  const now = new Date().toISOString();
  return {
    id: Date.now().toString(),
    taskId,
    name,
    completed: false,
    createdAt: now,
    updatedAt: now,
  };
}

/**
 * 计算计划的完成度
 */
export function calculatePlanProgress(plan: Plan): {
  completed: number;
  total: number;
  percentage: number;
} {
  const total = plan.tasks.length;
  const completed = plan.tasks.filter(t => t.completed).length;
  return {
    completed,
    total,
    percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

/**
 * 计算任务的完成度
 */
export function calculateTaskProgress(task: Task): {
  completed: number;
  total: number;
  percentage: number;
} {
  const total = task.subtasks.length;
  const completed = task.subtasks.filter(s => s.completed).length;
  return {
    completed,
    total,
    percentage: total === 0 ? 0 : Math.round((completed / total) * 100),
  };
}

/**
 * 获取统计数据
 */
export async function getStatistics() {
  try {
    const plans = await getAllPlans();
    
    let totalTasks = 0;
    let completedTasks = 0;
    let highPriorityTasks = 0;
    let mediumPriorityTasks = 0;
    let lowPriorityTasks = 0;
    
    plans.forEach(plan => {
      plan.tasks.forEach(task => {
        totalTasks++;
        if (task.completed) completedTasks++;
        
        if (task.priority === 'high') highPriorityTasks++;
        else if (task.priority === 'medium') mediumPriorityTasks++;
        else lowPriorityTasks++;
      });
    });
    
    return {
      totalPlans: plans.length,
      totalTasks,
      completedTasks,
      completionRate: totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100),
      highPriorityTasks,
      mediumPriorityTasks,
      lowPriorityTasks,
    };
  } catch (error) {
    console.error('Failed to get statistics:', error);
    return {
      totalPlans: 0,
      totalTasks: 0,
      completedTasks: 0,
      completionRate: 0,
      highPriorityTasks: 0,
      mediumPriorityTasks: 0,
      lowPriorityTasks: 0,
    };
  }
}
