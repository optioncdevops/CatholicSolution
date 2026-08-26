import { Link } from 'react-router-dom';
import type { AcutisMenuGroup } from '@/modules/auth/types';

/**
 * Renders whatever menu tree the backend returned — never computes or filters it further; the
 * server has already scoped it to the authenticated user's own rights (see
 * docs/acutis-auth-spec/reference-comparison.md §7). Handles an empty tree safely (no crash, a
 * plain message) rather than assuming at least one group always exists.
 */
export function NavMenu({ groups }: { groups: AcutisMenuGroup[] }) {
  if (!groups || groups.length === 0) {
    return <p className="text-sm text-gray-500">No menu items are available for this account.</p>;
  }

  return (
    <nav className="flex flex-col gap-4" aria-label="Main navigation">
      {groups.map((group) => (
        <div key={group.sessionKey || group.title}>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{group.title}</p>
          <ul className="mt-1 flex flex-col gap-1">
            {group.links.map((link) => (
              <li key={link.sessionKey || link.path}>
                <Link to={link.path || '#'} className="block rounded px-2 py-1 text-sm text-gray-800 hover:bg-gray-100">
                  {link.label}
                </Link>
              </li>
            ))}
            {group.links.length === 0 && <li className="px-2 text-sm text-gray-400">No items</li>}
          </ul>
        </div>
      ))}
    </nav>
  );
}
