import { createContext, Dispatch, ReactNode, SetStateAction, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { type Profile } from './types'

interface ProfilesContextType {
    profiles: Profile[];
    currentProfile: Profile;
    setCurrentProfile: Dispatch<SetStateAction<Profile | undefined>>;
    refetch: (profileId: number) => void
}

const ProfilesContext = createContext<ProfilesContextType | null | undefined>(undefined);

const fetchProfiles = async (
    setProfiles: Dispatch<SetStateAction<Profile[] | undefined>>,
    setCurrentProfile: Dispatch<SetStateAction<Profile | undefined>>
) => {
    const profilesData = await fetch('/admin/profiles');
    const profiles = await profilesData.json();
    setProfiles(profiles);
    setCurrentProfile(profiles[0]);
}

const ProfilesProvider = ({ children }: { children: ReactNode }) => {
    const [profiles, setProfiles] = useState<Profile[]>();
    const [currentProfile, setCurrentProfile] = useState<Profile>();

    const refetch = useCallback(async (profileId: number) => {
        const profilesData = await fetch('/admin/profiles');
        const profiles: Profile[] = await profilesData.json();
        setProfiles(profiles);
        setCurrentProfile(profiles.find(profile => profile.id === profileId));
    },[setProfiles, setCurrentProfile]);

    useEffect(() => {
        fetchProfiles(setProfiles, setCurrentProfile);
    }, []);
    
    const value = (!profiles || !currentProfile || !setCurrentProfile) ? null: {
        profiles,
        currentProfile,
        setCurrentProfile,
        refetch,
    }

    return (
        <ProfilesContext.Provider value={value}>
            {children}
        </ProfilesContext.Provider>
    )
}

export const useProfilesContext = () => {
    const profileData = useContext(ProfilesContext);
    if (profileData === undefined) {
        throw new Error('This hook should be wrapped inside a <ProfileProvider />');
    }
    return profileData;
}

export default ProfilesProvider;