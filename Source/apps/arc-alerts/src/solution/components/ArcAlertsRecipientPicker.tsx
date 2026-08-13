import { useMemo } from 'react';
import { SearchIcon } from '@shared/app/components/UiIcons';
import { DIRECTORY_RECIPIENT_GROUPS, DIRECTORY_RECIPIENTS } from '@shared/app/data/directoryRecipients';

export type AudienceMode = 'members' | 'groups';

interface ArcAlertsRecipientPickerProps {
  mode: AudienceMode;
  onModeChange: (mode: AudienceMode) => void;
  query: string;
  onQueryChange: (query: string) => void;
  selectedMembers: string[];
  onMembersChange: (ids: string[]) => void;
  selectedGroups: string[];
  onGroupsChange: (groups: string[]) => void;
}

export function ArcAlertsRecipientPicker({
  mode,
  onModeChange,
  query,
  onQueryChange,
  selectedMembers,
  onMembersChange,
  selectedGroups,
  onGroupsChange,
}: ArcAlertsRecipientPickerProps) {
  const visibleMembers = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return DIRECTORY_RECIPIENTS.filter((member) => !normalized ||
      [member.name, member.email, member.phone, ...member.groups].join(' ').toLowerCase().includes(normalized));
  }, [query]);

  const allMembersSelected = DIRECTORY_RECIPIENTS.length > 0 && DIRECTORY_RECIPIENTS.every((member) => selectedMembers.includes(member.id));
  const allGroupsSelected = DIRECTORY_RECIPIENT_GROUPS.length > 0 && DIRECTORY_RECIPIENT_GROUPS.every((group) => selectedGroups.includes(group));
  const selectedCount = mode === 'members' ? selectedMembers.length : selectedGroups.length;

  const toggleMember = (id: string) => onMembersChange(
    selectedMembers.includes(id) ? selectedMembers.filter((item) => item !== id) : [...selectedMembers, id],
  );
  const toggleGroup = (group: string) => onGroupsChange(
    selectedGroups.includes(group) ? selectedGroups.filter((item) => item !== group) : [...selectedGroups, group],
  );

  return (
    <fieldset className="arc-recipient-builder">
      <legend>Recipients <span>*</span></legend>
      <div className="arc-recipient-toolbar">
        <div className="arc-recipient-mode" role="tablist" aria-label="Recipient type">
          <button type="button" className={mode === 'members' ? 'is-active' : ''} onClick={() => onModeChange('members')}>Members</button>
          <button type="button" className={mode === 'groups' ? 'is-active' : ''} onClick={() => onModeChange('groups')}>Groups</button>
        </div>
        <span className="arc-recipient-count">{selectedCount} selected</span>
      </div>

      {mode === 'members' ? (
        <div className="arc-recipient-members">
          <div className="arc-recipient-select-all">
            <label>
              <input
                type="checkbox"
                checked={allMembersSelected}
                onChange={(event) => onMembersChange(event.target.checked ? DIRECTORY_RECIPIENTS.map((member) => member.id) : [])}
              />
              <span><strong>Select all members</strong><small>{DIRECTORY_RECIPIENTS.length} available</small></span>
            </label>
            {selectedMembers.length ? <button type="button" onClick={() => onMembersChange([])}>Clear selection</button> : null}
          </div>
          <label className="arc-recipient-search">
            <SearchIcon size={15}/>
            <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search name, email, phone or group" />
          </label>
          <div className="arc-recipient-list scrollbar-thin">
            {visibleMembers.map((member) => {
              const selected = selectedMembers.includes(member.id);
              return (
                <label key={member.id} className={selected ? 'is-selected' : ''}>
                  <input type="checkbox" checked={selected} onChange={() => toggleMember(member.id)}/>
                  <span><strong>{member.name}</strong><small>{member.email} · {member.phone}</small></span>
                  <em>{member.groups[0]}</em>
                </label>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="arc-recipient-groups">
          <div className="arc-recipient-select-all">
            <label>
              <input
                type="checkbox"
                checked={allGroupsSelected}
                onChange={(event) => onGroupsChange(event.target.checked ? [...DIRECTORY_RECIPIENT_GROUPS] : [])}
              />
              <span><strong>Select all groups</strong><small>{DIRECTORY_RECIPIENT_GROUPS.length} available</small></span>
            </label>
            {selectedGroups.length ? <button type="button" onClick={() => onGroupsChange([])}>Clear selection</button> : null}
          </div>
          <div className="arc-recipient-group-grid">
            {DIRECTORY_RECIPIENT_GROUPS.map((group) => {
              const selected = selectedGroups.includes(group);
              return (
                <label key={group} className={`arc-recipient-group ${selected ? 'is-selected' : ''}`}>
                  <input type="checkbox" checked={selected} onChange={() => toggleGroup(group)}/>
                  <span><strong>{group}</strong><small>{DIRECTORY_RECIPIENTS.filter((member) => member.groups.includes(group)).length} members</small></span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </fieldset>
  );
}
