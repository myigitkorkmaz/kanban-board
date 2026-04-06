import { useState, useEffect, useCallback } from 'react';
import { supabase, ensureGuestSession } from '../lib/supabase';
import type { Task, Comment, ActivityLog, TeamMember, Label, Status, Priority } from '../types';

export function useBoard() {
  const [userId, setUserId] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [labels, setLabels] = useState<Label[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize guest session
  useEffect(() => {
    async function init() {
      try {
        const { data } = await ensureGuestSession();
        if (data.session?.user) {
          setUserId(data.session.user.id);
        }
      } catch (err) {
        setError('Failed to initialize session');
        setLoading(false);
      }
    }
    init();
  }, []);

  // Fetch all data once userId is known
  useEffect(() => {
    if (!userId) return;
    fetchAll();
  }, [userId]);

  async function fetchAll() {
    setLoading(true);
    try {
      const [tasksRes, membersRes, labelsRes] = await Promise.all([
        supabase.from('tasks').select('*').order('created_at', { ascending: false }),
        supabase.from('team_members').select('*').order('created_at'),
        supabase.from('labels').select('*').order('created_at'),
      ]);
      if (tasksRes.error) throw tasksRes.error;
      if (membersRes.error) throw membersRes.error;
      if (labelsRes.error) throw labelsRes.error;

      setTasks(tasksRes.data || []);
      setMembers(membersRes.data || []);
      setLabels(labelsRes.data || []);
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }

  const fetchComments = useCallback(async (taskId: string) => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at');
    if (error) throw error;
    setComments(data || []);
    return data || [];
  }, []);

  const fetchActivity = useCallback(async (taskId: string) => {
    const { data, error } = await supabase
      .from('activity_logs')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    setActivity(data || []);
    return data || [];
  }, []);

  const createTask = useCallback(async (input: {
    title: string;
    description?: string;
    priority: Priority;
    due_date?: string;
    status?: Status;
    assignee_ids?: string[];
    label_ids?: string[];
  }) => {
    const { data, error } = await supabase.from('tasks').insert({
      title: input.title,
      description: input.description || null,
      priority: input.priority,
      due_date: input.due_date || null,
      status: input.status || 'todo',
      assignee_ids: input.assignee_ids || [],
      label_ids: input.label_ids || [],
    }).select().single();
    if (error) throw error;
    setTasks(prev => [data, ...prev]);
    return data;
  }, []);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>, logAction?: { action: string; old_value?: string; new_value?: string }) => {
    const { data, error } = await supabase.from('tasks').update(updates).eq('id', id).select().single();
    if (error) throw error;
    setTasks(prev => prev.map(t => t.id === id ? data : t));

    if (logAction) {
      await supabase.from('activity_logs').insert({
        task_id: id,
        action: logAction.action,
        old_value: logAction.old_value || null,
        new_value: logAction.new_value || null,
      });
    }
    return data;
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', id);
    if (error) throw error;
    setTasks(prev => prev.filter(t => t.id !== id));
  }, []);

  const moveTask = useCallback(async (taskId: string, newStatus: Status) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task || task.status === newStatus) return;
    const oldStatus = task.status;

    // Optimistic update
    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t));

    const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId);
    if (error) {
      // Revert
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: oldStatus } : t));
      throw error;
    }

    await supabase.from('activity_logs').insert({
      task_id: taskId,
      action: 'status_changed',
      old_value: oldStatus,
      new_value: newStatus,
    });
  }, [tasks]);

  const addComment = useCallback(async (taskId: string, content: string) => {
    const { data, error } = await supabase.from('comments').insert({
      task_id: taskId,
      content,
    }).select().single();
    if (error) throw error;
    setComments(prev => [...prev, data]);
    return data;
  }, []);

  const createMember = useCallback(async (name: string, color: string) => {
    const initials = name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    const { data, error } = await supabase.from('team_members').insert({ name, color, initials }).select().single();
    if (error) throw error;
    setMembers(prev => [...prev, data]);
    return data;
  }, []);

  const createLabel = useCallback(async (name: string, color: string) => {
    const { data, error } = await supabase.from('labels').insert({ name, color }).select().single();
    if (error) throw error;
    setLabels(prev => [...prev, data]);
    return data;
  }, []);

  const deleteMember = useCallback(async (id: string) => {
    const { error } = await supabase.from('team_members').delete().eq('id', id);
    if (error) throw error;
    setMembers(prev => prev.filter(m => m.id !== id));
  }, []);

  const deleteLabel = useCallback(async (id: string) => {
    const { error } = await supabase.from('labels').delete().eq('id', id);
    if (error) throw error;
    setLabels(prev => prev.filter(l => l.id !== id));
  }, []);

  return {
    userId, tasks, comments, activity, members, labels,
    loading, error,
    fetchComments, fetchActivity,
    createTask, updateTask, deleteTask, moveTask,
    addComment,
    createMember, createLabel, deleteMember, deleteLabel,
    refetch: fetchAll,
  };
}
