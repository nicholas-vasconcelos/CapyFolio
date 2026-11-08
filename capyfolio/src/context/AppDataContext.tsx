import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import type { Dispatch, ReactNode, SetStateAction } from 'react';
import type { Event, Post, Project, User } from '../types';
import { userService } from '../services/userService';
import { projectService } from '../services/projectService';
import { eventService } from '../services/eventService';
import { postService } from '../services/postService';
import { connectionService, favoriteService, registrationService } from '../services/membershipServices';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

type AppDataContextType = {
  users: User[];
  projects: Project[];
  events: Event[];
  posts: Post[];
  /** Ids owned by the signed-in account. */
  favoritedProjectIds: string[];
  registeredEventIds: string[];
  connectedUserIds: string[];
  loading: boolean;
  error: string | null;
  setUsers: Dispatch<SetStateAction<User[]>>;
  setProjects: Dispatch<SetStateAction<Project[]>>;
  setEvents: Dispatch<SetStateAction<Event[]>>;
  setPosts: Dispatch<SetStateAction<Post[]>>;
  setFavoritedProjectIds: Dispatch<SetStateAction<string[]>>;
  setRegisteredEventIds: Dispatch<SetStateAction<string[]>>;
  setConnectedUserIds: Dispatch<SetStateAction<string[]>>;
  refreshData: () => Promise<void>;
};

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export const LOAD_ERROR_MESSAGE = 'Não foi possível carregar os dados. Verifique sua conexão e tente novamente.';

export function AppDataProvider({ children }: { children: ReactNode }) {
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  // showToast changes identity on every toast; a ref keeps refreshData stable so toasts never trigger a refetch.
  const showToastRef = useRef(showToast);
  useEffect(() => {
    showToastRef.current = showToast;
  }, [showToast]);
  const profileId = currentUser?.id ?? null;

  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [favoritedProjectIds, setFavoritedProjectIds] = useState<string[]>([]);
  const [registeredEventIds, setRegisteredEventIds] = useState<string[]>([]);
  const [connectedUserIds, setConnectedUserIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clear = useCallback(() => {
    setUsers([]);
    setProjects([]);
    setEvents([]);
    setPosts([]);
    setFavoritedProjectIds([]);
    setRegisteredEventIds([]);
    setConnectedUserIds([]);
  }, []);

  const refreshData = useCallback(async () => {
    // Everything is behind RLS for signed-in users only; without a session there is nothing to load.
    if (!profileId) {
      clear();
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const [userList, projectList, eventList, postList, favorites, registrations, connections] = await Promise.all([
        userService.list(),
        projectService.list(),
        eventService.list(),
        postService.list(),
        favoriteService.listIds(profileId),
        registrationService.listIds(profileId),
        connectionService.listIds(profileId),
      ]);
      setUsers(userList);
      setProjects(projectList);
      setEvents(eventList);
      setPosts(postList);
      setFavoritedProjectIds(favorites);
      setRegisteredEventIds(registrations);
      setConnectedUserIds(connections);
    } catch (cause) {
      console.error(cause);
      setError(LOAD_ERROR_MESSAGE);
      showToastRef.current(LOAD_ERROR_MESSAGE);
    } finally {
      setLoading(false);
    }
  }, [profileId, clear]);

  // Reload whenever the signed-in account changes (sign-in, sign-out, switching accounts).
  useEffect(() => {
    void refreshData();
  }, [refreshData]);

  const value = useMemo<AppDataContextType>(
    () => ({
      users,
      projects,
      events,
      posts,
      favoritedProjectIds,
      registeredEventIds,
      connectedUserIds,
      loading,
      error,
      setUsers,
      setProjects,
      setEvents,
      setPosts,
      setFavoritedProjectIds,
      setRegisteredEventIds,
      setConnectedUserIds,
      refreshData,
    }),
    [users, projects, events, posts, favoritedProjectIds, registeredEventIds, connectedUserIds, loading, error, refreshData],
  );

  return <AppDataContext.Provider value={value}>{children}</AppDataContext.Provider>;
}

export function useAppData() {
  const context = useContext(AppDataContext);
  if (!context) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}
