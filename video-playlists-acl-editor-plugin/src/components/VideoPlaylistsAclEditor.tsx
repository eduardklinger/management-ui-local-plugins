import React, { useEffect, useState } from "react";

import { useGetAllManagedAclsQuery, type GetAllManagedAclsQuery } from "@workspace/query";
import {
  AclEditor,
  type ACLEntry,
  type AclData,
  type ManagedACLEntry,
} from "@workspace/ui/components";

export interface VideoPlaylistsAclEditorProps {
  aclData?: AclData | null;
  onAclDataChange: (aclData: AclData, managedAclId: string) => void;
  disabled?: boolean;
  refetch?: () => void;
}

export const VideoPlaylistsAclEditor: React.FC<VideoPlaylistsAclEditorProps> = ({
  aclData,
  onAclDataChange,
  disabled = false,
  refetch = () => {},
}) => {
  const [hasChanges, setHasChanges] = useState(false);
  const [managedAclId, setManagedAclId] = useState<string | undefined>(undefined);
  const [entries, setEntries] = useState<ACLEntry[]>([]);

  type ManagedAclNode = NonNullable<GetAllManagedAclsQuery["managedAcls"]["nodes"][number]>;
  const [managedAcls, setManagedAcls] = useState<ManagedAclNode[]>([]);
  const [managedAclEntries, setManagedAclEntries] = useState<ManagedACLEntry[]>([]);

  const { data: managedAclsData } = useGetAllManagedAclsQuery();

  useEffect(() => {
    const nodes = managedAclsData?.managedAcls?.nodes ?? [];
    setManagedAcls(nodes.filter((node): node is ManagedAclNode => node !== null));
  }, [managedAclsData]);

  useEffect(() => {
    setManagedAclId(aclData?.managedAclId);
  }, [aclData?.managedAclId]);

  const onManagedAclChange = (aclId: string) => {
    setManagedAclId(aclId);

    const selectedAcl = managedAcls.find((acl) => acl.id === aclId);
    const selectedEntries = selectedAcl?.acl?.entries ?? [];

    setManagedAclEntries(
      selectedEntries
        .filter((entry): entry is ManagedACLEntry => entry !== null)
        .map((entry) => ({
          role: entry.role ?? null,
          action: entry.action ?? null,
        })),
    );
  };

  const onAclChange = (updatedEntries: ACLEntry[]) => {
    setEntries(updatedEntries);
  };

  const onHasChangesChange = (nextHasChanges: boolean) => {
    setHasChanges(nextHasChanges);
  };

  useEffect(() => {
    onAclDataChange(
      {
        entries: entries.map((entry) => ({ role: entry.role, action: entry.action })),
        managedAclEntries,
        managedAclId: managedAclId ?? "",
      },
      managedAclId ?? "",
    );
  }, [entries, managedAclEntries, managedAclId, onAclDataChange]);

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium">ACL</h3>
      <AclEditor
        aclEntries={
          aclData?.entries.map((entry) => ({
            role: entry.role,
            action: entry.action,
            label: entry.role,
            userId: "",
          })) ?? []
        }
        managedAclId={managedAclId}
        hasChanges={hasChanges}
        refetch={refetch}
        onClose={() => {}}
        showUpdateButton={false}
        onAclChange={onAclChange}
        onManagedAclChange={onManagedAclChange}
        onHasChangesChange={onHasChangesChange}
        disabled={disabled}
      />
    </div>
  );
};
