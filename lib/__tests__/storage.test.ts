import { describe, it, expect, beforeEach, vi } from 'vitest';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getAllPlans,
  savePlan,
  deletePlan,
  createPlan,
  createTask,
  createSubtask,
  calculatePlanProgress,
  calculateTaskProgress,
  getStatistics,
} from '../storage';

// Mock AsyncStorage
vi.mock('@react-native-async-storage/async-storage', () => ({
  default: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  },
}));

describe('Storage Module', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createPlan', () => {
    it('should create a plan with correct properties', () => {
      const plan = createPlan('Test Plan', 'Test Description', 'high', '2026-02-01');
      
      expect(plan.name).toBe('Test Plan');
      expect(plan.description).toBe('Test Description');
      expect(plan.priority).toBe('high');
      expect(plan.targetDate).toBe('2026-02-01');
      expect(plan.tasks).toEqual([]);
      expect(plan.id).toBeDefined();
      expect(plan.createdAt).toBeDefined();
      expect(plan.updatedAt).toBeDefined();
    });

    it('should set default priority to medium', () => {
      const plan = createPlan('Test Plan', 'Test Description');
      expect(plan.priority).toBe('medium');
    });
  });

  describe('createTask', () => {
    it('should create a task with correct properties', () => {
      const task = createTask('plan-1', 'Test Task', 'Task Description', 'high', '2026-02-01');
      
      expect(task.planId).toBe('plan-1');
      expect(task.name).toBe('Test Task');
      expect(task.description).toBe('Task Description');
      expect(task.priority).toBe('high');
      expect(task.dueDate).toBe('2026-02-01');
      expect(task.completed).toBe(false);
      expect(task.subtasks).toEqual([]);
      expect(task.id).toBeDefined();
    });
  });

  describe('createSubtask', () => {
    it('should create a subtask with correct properties', () => {
      const subtask = createSubtask('task-1', 'Test Subtask');
      
      expect(subtask.taskId).toBe('task-1');
      expect(subtask.name).toBe('Test Subtask');
      expect(subtask.completed).toBe(false);
      expect(subtask.id).toBeDefined();
    });
  });

  describe('calculatePlanProgress', () => {
    it('should calculate progress correctly', () => {
      const plan = createPlan('Test Plan', 'Description');
      const task1 = createTask(plan.id, 'Task 1', 'Description');
      const task2 = createTask(plan.id, 'Task 2', 'Description');
      task2.completed = true;

      plan.tasks = [task1, task2];

      const progress = calculatePlanProgress(plan);
      
      expect(progress.total).toBe(2);
      expect(progress.completed).toBe(1);
      expect(progress.percentage).toBe(50);
    });

    it('should return 0% for empty plan', () => {
      const plan = createPlan('Test Plan', 'Description');
      const progress = calculatePlanProgress(plan);
      
      expect(progress.total).toBe(0);
      expect(progress.completed).toBe(0);
      expect(progress.percentage).toBe(0);
    });

    it('should return 100% for all completed tasks', () => {
      const plan = createPlan('Test Plan', 'Description');
      const task1 = createTask(plan.id, 'Task 1', 'Description');
      const task2 = createTask(plan.id, 'Task 2', 'Description');
      task1.completed = true;
      task2.completed = true;

      plan.tasks = [task1, task2];

      const progress = calculatePlanProgress(plan);
      
      expect(progress.percentage).toBe(100);
    });
  });

  describe('calculateTaskProgress', () => {
    it('should calculate task progress correctly', () => {
      const task = createTask('plan-1', 'Test Task', 'Description');
      const subtask1 = createSubtask(task.id, 'Subtask 1');
      const subtask2 = createSubtask(task.id, 'Subtask 2');
      subtask2.completed = true;

      task.subtasks = [subtask1, subtask2];

      const progress = calculateTaskProgress(task);
      
      expect(progress.total).toBe(2);
      expect(progress.completed).toBe(1);
      expect(progress.percentage).toBe(50);
    });

    it('should return 0% for task without subtasks', () => {
      const task = createTask('plan-1', 'Test Task', 'Description');
      const progress = calculateTaskProgress(task);
      
      expect(progress.total).toBe(0);
      expect(progress.completed).toBe(0);
      expect(progress.percentage).toBe(0);
    });
  });

  describe('getAllPlans', () => {
    it('should return empty array when no plans exist', async () => {
      (AsyncStorage.getItem as any).mockResolvedValue(null);
      
      const plans = await getAllPlans();
      
      expect(plans).toEqual([]);
    });

    it('should return parsed plans from storage', async () => {
      const mockPlans = [
        createPlan('Plan 1', 'Description 1'),
        createPlan('Plan 2', 'Description 2'),
      ];
      (AsyncStorage.getItem as any).mockResolvedValue(JSON.stringify(mockPlans));
      
      const plans = await getAllPlans();
      
      expect(plans).toHaveLength(2);
      expect(plans[0].name).toBe('Plan 1');
      expect(plans[1].name).toBe('Plan 2');
    });
  });

  describe('savePlan', () => {
    it('should save a new plan', async () => {
      (AsyncStorage.getItem as any).mockResolvedValue(null);
      const plan = createPlan('New Plan', 'Description');
      
      await savePlan(plan);
      
      expect(AsyncStorage.setItem).toHaveBeenCalled();
      const callArgs = (AsyncStorage.setItem as any).mock.calls[0];
      const savedPlans = JSON.parse(callArgs[1]);
      expect(savedPlans).toHaveLength(1);
      expect(savedPlans[0].name).toBe('New Plan');
    });

    it('should update existing plan', async () => {
      const plan1 = createPlan('Plan 1', 'Description 1');
      const plan2 = createPlan('Plan 2', 'Description 2');
      (AsyncStorage.getItem as any).mockResolvedValue(JSON.stringify([plan1, plan2]));
      
      plan1.name = 'Updated Plan 1';
      await savePlan(plan1);
      
      const callArgs = (AsyncStorage.setItem as any).mock.calls[0];
      const savedPlans = JSON.parse(callArgs[1]);
      expect(savedPlans).toHaveLength(2);
      expect(savedPlans[0].name).toBe('Updated Plan 1');
    });
  });

  describe('getStatistics', () => {
    it('should calculate statistics correctly', async () => {
      const plan = createPlan('Test Plan', 'Description');
      const task1 = createTask(plan.id, 'Task 1', 'Description');
      const task2 = createTask(plan.id, 'Task 2', 'Description');
      task1.priority = 'high';
      task1.completed = true;
      task2.priority = 'medium';

      plan.tasks = [task1, task2];

      (AsyncStorage.getItem as any).mockResolvedValue(JSON.stringify([plan]));
      
      const stats = await getStatistics();
      
      expect(stats.totalPlans).toBe(1);
      expect(stats.totalTasks).toBe(2);
      expect(stats.completedTasks).toBe(1);
      expect(stats.completionRate).toBe(50);
      expect(stats.highPriorityTasks).toBe(1);
      expect(stats.mediumPriorityTasks).toBe(1);
    });
  });
});
