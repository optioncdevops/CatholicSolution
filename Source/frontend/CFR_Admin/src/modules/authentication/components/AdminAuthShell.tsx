import type { ReactNode } from 'react';
import { SolutionHead } from '@shared/platform/branding/SolutionHead';
import './adminAuth.css';

interface AdminAuthShellProps {
  children: ReactNode;
}

/**
 * Sign-in shell for the Super Admin console — a focused, single centered card, distinct from
 * the member-facing `AuthShell` (split layout with the full app showcase) used by the CFR
 * Portal, so the two entry points still read as different products.
 */
export function AdminAuthShell({ children }: AdminAuthShellProps) {
  return (
    <main className="admin-auth-shell">
      <SolutionHead pageTitle="Admin Sign In" />
      <div className="admin-auth-form-panel">
        <div className="admin-auth-form-panel__body">{children}</div>
        <footer className="admin-auth-form-panel__footer">
          <span>© 2026 Catholic Solutions</span>
        </footer>
      </div>
    </main>
  );
}
