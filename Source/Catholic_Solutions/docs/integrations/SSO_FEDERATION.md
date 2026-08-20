# Cross-Domain Authentication / Federation Boundary

The universal App Switcher does not transfer login state. This is intentional.

Connected products may live on unrelated domains, so authentication must not depend on a shared browser-cookie domain. CFR keeps its own host-scoped session. A future production SSO implementation should use a dedicated identity provider and a standard federation flow per application.

## Responsibilities

**Catholic Solutions platform team**

- owns identity-provider/client registration policy;
- approves redirect/callback URLs;
- defines scopes/claims and logout behavior;
- keeps secrets out of browser `VITE_*` configuration.

**Connected application team**

- registers its approved callback URL;
- implements the platform-approved federation client for its framework;
- creates its own local application session after successful federation;
- does not attempt to read CFR cookies or App Switcher state.

Launcher registration and SSO registration are separate approvals. An app may be visible in App Hub/Launcher before federation is enabled.
