import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import type { Project, User } from '../../types';
import { HeroSlot } from '../../widgets/HeroSlot';
import { WidgetGrid } from '../../widgets/WidgetGrid';
import { layoutContextFor, resolveLayout } from '../../widgets/layout';
import type { WidgetRenderContext } from '../../widgets/viewTypes';
import { ProfileCore } from './ProfileCore';
import { ProfileEditor } from './edit/ProfileEditor';

interface ProfilePageProps {
  currentUser: User;
  users: User[];
  projects: Project[];
  connectedUserIds: string[];
  onToggleConnect: (userId: string) => void;
  onSetFeaturedProject: (projectId: string) => void;
  onOpenNewProject: () => void;
  onUpdateUser: (next: User) => Promise<void>;
}

export function ProfilePage(props: ProfilePageProps) {
  const { id } = useParams();
  // Read from `users`, not the session copy, so saved changes show on /perfil too.
  const profileUser = props.users.find((user) => user.id === (id ?? props.currentUser.id)) ?? props.currentUser;
  const isOwnProfile = !id || id === props.currentUser.id;

  // Keyed by profile, so widget mode never carries over to another person's page.
  return <ProfileScreen key={profileUser.id} {...props} profileUser={profileUser} isOwnProfile={isOwnProfile} />;
}

function ProfileScreen({ profileUser, isOwnProfile, projects, connectedUserIds, onToggleConnect, onSetFeaturedProject, onOpenNewProject, onUpdateUser }: ProfilePageProps & {
  profileUser: User;
  isOwnProfile: boolean;
}) {
  const [isEditing, setIsEditing] = useState(false);

  // Saved layout (cleaned) or the default one, which reproduces the old page.
  const layout = useMemo(() => resolveLayout(profileUser, projects), [profileUser, projects]);

  const ctx = useMemo<WidgetRenderContext>(() => {
    const pinnedProjectIds = [layout.hero, ...layout.widgets]
      .filter((widget) => widget?.type === 'pinnedProject')
      .map((widget) => widget!.config.projectId as string);
    return {
      ...layoutContextFor(profileUser, projects),
      isOwner: isOwnProfile,
      pinnedProjectIds,
      onOpenNewProject: isOwnProfile ? onOpenNewProject : undefined,
      onSetFeaturedProject: isOwnProfile ? onSetFeaturedProject : undefined,
    };
  }, [layout, profileUser, projects, isOwnProfile, onOpenNewProject, onSetFeaturedProject]);

  if (isEditing && isOwnProfile) {
    return (
      <ProfileEditor
        user={profileUser}
        projects={projects}
        initialLayout={layout}
        onUpdateUser={onUpdateUser}
        onOpenNewProject={onOpenNewProject}
        onExit={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <ProfileCore
        user={profileUser}
        isOwnProfile={isOwnProfile}
        isConnected={connectedUserIds.includes(profileUser.id)}
        onToggleConnect={() => onToggleConnect(profileUser.id)}
        onOpenNewProject={onOpenNewProject}
        onToggleEditing={isOwnProfile ? () => setIsEditing(true) : undefined}
        heroSlot={<HeroSlot layout={layout} ctx={ctx} />}
      />

      <main className="mx-auto box-border max-w-[1344px] px-4 pb-[88px] pt-12 sm:px-6 md:px-12">
        <WidgetGrid layout={layout} ctx={ctx} />
      </main>
    </div>
  );
}
