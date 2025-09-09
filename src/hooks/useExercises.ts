import { useState, useEffect, useCallback } from 'react';
import { exerciseApi } from '@/app/services-client/exerciseApi';
import { ExerciseQueryParams, ExerciseResponse } from '@/models/Exercise';
import { Exercise } from '@/models/Exercise';

// Hook for fetching exercises with loading and error states
export function useExercises(params: ExerciseQueryParams = {}) {
  const [data, setData] = useState<ExerciseResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExercises = useCallback(async (queryParams: ExerciseQueryParams = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await exerciseApi.getExercises({ ...params, ...queryParams });
      setData(response);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch exercises');
    } finally {
      setLoading(false);
    }
  }, [params]);

  useEffect(() => {
    fetchExercises();
  }, [fetchExercises]);

  const refetch = useCallback(() => {
    fetchExercises();
  }, [fetchExercises]);

  const updateParams = useCallback((newParams: Partial<ExerciseQueryParams>) => {
    fetchExercises(newParams);
  }, [fetchExercises]);

  return {
    data,
    loading,
    error,
    refetch,
    updateParams,
  };
}

// Hook for fetching a single exercise
export function useExercise(id: string) {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchExercise = useCallback(async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await exerciseApi.getExerciseById(id);
      setExercise(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch exercise');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchExercise();
  }, [fetchExercise]);

  return {
    exercise,
    loading,
    error,
    refetch: fetchExercise,
  };
}

// Hook for searching exercises
export function useExerciseSearch() {
  const [results, setResults] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (searchTerm: string) => {
    if (!searchTerm.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const data = await exerciseApi.searchExercises(searchTerm);
      setResults(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search exercises');
    } finally {
      setLoading(false);
    }
  }, []);

  const clearResults = useCallback(() => {
    setResults([]);
    setError(null);
  }, []);

  return {
    results,
    loading,
    error,
    search,
    clearResults,
  };
}

// Hook for available filters
export function useExerciseFilters() {
  const [filters, setFilters] = useState<{
    availableTypes: string[];
    availableTags: string[];
    totalExercises: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchFilters = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await exerciseApi.getAvailableFilters();
      setFilters(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch filters');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFilters();
  }, [fetchFilters]);

  return {
    filters,
    loading,
    error,
    refetch: fetchFilters,
  };
}
