import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import {
  Plan,
  Task,
  Subtask,
  getAllPlans,
  savePlan,
  deletePlan,
  createPlan as createPlanUtil,
  createTask as createTaskUtil,
  createSubtask as createSubtaskUtil,
  calculatePlanProgress,
  calculateTaskProgress,
} from './storage';

interface PlanContextType {
  plans: Plan[];
  loading: boolean;
  
  // Plan operations
  loadPlans: () => Promise<void>;
  createPlan: (name: string, description: string, priority?: 'high' | 'medium' | 'low', targetDate?: string) => Promise<Plan>;
  updatePlan: (plan: Plan) => Promise<void>;
  removePlan: (planId: string) => Promise<void>;
  
  // Task operations
  addTask: (planId: string, name: string, description: string, priority?: 'high' | 'medium' | 'low', dueDate?: string) => Promise<Task>;
  updateTask: (planId: string, task: Task) => Promise<void>;
  removeTask: (planId: string, taskId: string) => Promise<void>;
  toggleTask: (planId: string, taskId: string) => Promise<void>;
  
  // Subtask operations
  addSubtask: (planId: string, taskId: string, name: string) => Promise<Subtask>;
  updateSubtask: (planId: string, taskId: string, subtask: Subtask) => Promise<void>;
  removeSubtask: (planId: string, taskId: string, subtaskId: string) => Promise<void>;
  toggleSubtask: (planId: string, taskId: string, subtaskId: string) => Promise<void>;
  
  // Utility
  getPlanById: (planId: string) => Plan | undefined;
  getTaskById: (planId: string, taskId: string) => Task | undefined;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);

type Action =
  | { type: 'SET_PLANS'; payload: Plan[] }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'ADD_PLAN'; payload: Plan }
  | { type: 'UPDATE_PLAN'; payload: Plan }
  | { type: 'DELETE_PLAN'; payload: string };

function planReducer(state: Plan[], action: Action): Plan[] {
  switch (action.type) {
    case 'SET_PLANS':
      return action.payload;
    case 'ADD_PLAN':
      return [action.payload, ...state];
    case 'UPDATE_PLAN':
      return state.map(p => p.id === action.payload.id ? action.payload : p);
    case 'DELETE_PLAN':
      return state.filter(p => p.id !== action.payload);
    default:
      return state;
  }
}

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [plans, dispatch] = useReducer(planReducer, []);
  const [loading, setLoading] = React.useState(true);

  const loadPlans = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getAllPlans();
      dispatch({ type: 'SET_PLANS', payload: data });
    } catch (error) {
      console.error('Failed to load plans:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPlans();
  }, [loadPlans]);

  const createPlan = useCallback(
    async (name: string, description: string, priority: 'high' | 'medium' | 'low' = 'medium', targetDate?: string) => {
      const newPlan = createPlanUtil(name, description, priority, targetDate);
      await savePlan(newPlan);
      dispatch({ type: 'ADD_PLAN', payload: newPlan });
      return newPlan;
    },
    []
  );

  const updatePlan = useCallback(async (plan: Plan) => {
    const updated = { ...plan, updatedAt: new Date().toISOString() };
    await savePlan(updated);
    dispatch({ type: 'UPDATE_PLAN', payload: updated });
  }, []);

  const removePlan = useCallback(async (planId: string) => {
    await deletePlan(planId);
    dispatch({ type: 'DELETE_PLAN', payload: planId });
  }, []);

  const addTask = useCallback(
    async (planId: string, name: string, description: string, priority: 'high' | 'medium' | 'low' = 'medium', dueDate?: string) => {
      const plan = plans.find(p => p.id === planId);
      if (!plan) throw new Error('Plan not found');

      const newTask = createTaskUtil(planId, name, description, priority, dueDate);
      const updated = {
        ...plan,
        tasks: [...plan.tasks, newTask],
        updatedAt: new Date().toISOString(),
      };
      await savePlan(updated);
      dispatch({ type: 'UPDATE_PLAN', payload: updated });
      return newTask;
    },
    [plans]
  );

  const updateTask = useCallback(
    async (planId: string, task: Task) => {
      const plan = plans.find(p => p.id === planId);
      if (!plan) throw new Error('Plan not found');

      const updated = {
        ...plan,
        tasks: plan.tasks.map(t => t.id === task.id ? { ...task, updatedAt: new Date().toISOString() } : t),
        updatedAt: new Date().toISOString(),
      };
      await savePlan(updated);
      dispatch({ type: 'UPDATE_PLAN', payload: updated });
    },
    [plans]
  );

  const removeTask = useCallback(
    async (planId: string, taskId: string) => {
      const plan = plans.find(p => p.id === planId);
      if (!plan) throw new Error('Plan not found');

      const updated = {
        ...plan,
        tasks: plan.tasks.filter(t => t.id !== taskId),
        updatedAt: new Date().toISOString(),
      };
      await savePlan(updated);
      dispatch({ type: 'UPDATE_PLAN', payload: updated });
    },
    [plans]
  );

  const toggleTask = useCallback(
    async (planId: string, taskId: string) => {
      const plan = plans.find(p => p.id === planId);
      if (!plan) throw new Error('Plan not found');

      const task = plan.tasks.find(t => t.id === taskId);
      if (!task) throw new Error('Task not found');

      const now = new Date().toISOString();
      const updated = {
        ...plan,
        tasks: plan.tasks.map(t =>
          t.id === taskId
            ? {
                ...t,
                completed: !t.completed,
                completedAt: !t.completed ? now : undefined,
                updatedAt: now,
              }
            : t
        ),
        updatedAt: now,
      };
      await savePlan(updated);
      dispatch({ type: 'UPDATE_PLAN', payload: updated });
    },
    [plans]
  );

  const addSubtask = useCallback(
    async (planId: string, taskId: string, name: string) => {
      const plan = plans.find(p => p.id === planId);
      if (!plan) throw new Error('Plan not found');

      const task = plan.tasks.find(t => t.id === taskId);
      if (!task) throw new Error('Task not found');

      const newSubtask = createSubtaskUtil(taskId, name);
      const updated = {
        ...plan,
        tasks: plan.tasks.map(t =>
          t.id === taskId
            ? {
                ...t,
                subtasks: [...t.subtasks, newSubtask],
                updatedAt: new Date().toISOString(),
              }
            : t
        ),
        updatedAt: new Date().toISOString(),
      };
      await savePlan(updated);
      dispatch({ type: 'UPDATE_PLAN', payload: updated });
      return newSubtask;
    },
    [plans]
  );

  const updateSubtask = useCallback(
    async (planId: string, taskId: string, subtask: Subtask) => {
      const plan = plans.find(p => p.id === planId);
      if (!plan) throw new Error('Plan not found');

      const updated = {
        ...plan,
        tasks: plan.tasks.map(t =>
          t.id === taskId
            ? {
                ...t,
                subtasks: t.subtasks.map(s => s.id === subtask.id ? { ...subtask, updatedAt: new Date().toISOString() } : s),
                updatedAt: new Date().toISOString(),
              }
            : t
        ),
        updatedAt: new Date().toISOString(),
      };
      await savePlan(updated);
      dispatch({ type: 'UPDATE_PLAN', payload: updated });
    },
    [plans]
  );

  const removeSubtask = useCallback(
    async (planId: string, taskId: string, subtaskId: string) => {
      const plan = plans.find(p => p.id === planId);
      if (!plan) throw new Error('Plan not found');

      const updated = {
        ...plan,
        tasks: plan.tasks.map(t =>
          t.id === taskId
            ? {
                ...t,
                subtasks: t.subtasks.filter(s => s.id !== subtaskId),
                updatedAt: new Date().toISOString(),
              }
            : t
        ),
        updatedAt: new Date().toISOString(),
      };
      await savePlan(updated);
      dispatch({ type: 'UPDATE_PLAN', payload: updated });
    },
    [plans]
  );

  const toggleSubtask = useCallback(
    async (planId: string, taskId: string, subtaskId: string) => {
      const plan = plans.find(p => p.id === planId);
      if (!plan) throw new Error('Plan not found');

      const now = new Date().toISOString();
      const updated = {
        ...plan,
        tasks: plan.tasks.map(t =>
          t.id === taskId
            ? {
                ...t,
                subtasks: t.subtasks.map(s =>
                  s.id === subtaskId
                    ? {
                        ...s,
                        completed: !s.completed,
                        completedAt: !s.completed ? now : undefined,
                        updatedAt: now,
                      }
                    : s
                ),
                updatedAt: now,
              }
            : t
        ),
        updatedAt: now,
      };
      await savePlan(updated);
      dispatch({ type: 'UPDATE_PLAN', payload: updated });
    },
    [plans]
  );

  const getPlanById = useCallback((planId: string) => {
    return plans.find(p => p.id === planId);
  }, [plans]);

  const getTaskById = useCallback((planId: string, taskId: string) => {
    const plan = plans.find(p => p.id === planId);
    return plan?.tasks.find(t => t.id === taskId);
  }, [plans]);

  const value: PlanContextType = {
    plans,
    loading,
    loadPlans,
    createPlan,
    updatePlan,
    removePlan,
    addTask,
    updateTask,
    removeTask,
    toggleTask,
    addSubtask,
    updateSubtask,
    removeSubtask,
    toggleSubtask,
    getPlanById,
    getTaskById,
  };

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlanContext() {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error('usePlanContext must be used within PlanProvider');
  }
  return context;
}
