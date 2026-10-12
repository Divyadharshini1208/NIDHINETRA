# Role-Based Access Control (RBAC) Matrix

**MPLADS Monitoring and Decision Support Platform**

| Capability / Resource | Public Citizen | Member of Parliament (`ROLE_MP`) | District Authority (`ROLE_DISTRICT_AUTHORITY`) | State Nodal Authority (`ROLE_STATE_NODAL_AUTHORITY`) | Ministry Admin (`ROLE_MINISTRY_ADMIN`) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Public Portal & Insights** | ✅ Read-only | ✅ Read-only | ✅ Read-only | ✅ Read-only | ✅ Read-only |
| **Registration Self-Service** | ❌ | ✅ Yes | ✅ Yes | ✅ Yes | ❌ (MoSPI Admin Provisioning Only) |
| **Constituency Project Tracker** | ❌ | ✅ Own PC Only | ❌ | ❌ | ✅ All Constituencies |
| **District Project Inspection & Approvals** | ❌ | ❌ | ✅ Own District Only | ❌ | ✅ All Districts |
| **State-Level Performance Analytics** | ❌ | ❌ | ❌ | ✅ Own State Only | ✅ All States / National |
| **National Overview & Policy Analytics** | ❌ | ❌ | ❌ | ❌ | ✅ Full Access |
| **Audit Logs Inspection** | ❌ | ❌ | ❌ | ❌ | ✅ Full Audit Trail |
| **Protected Health Endpoint (`/api/health`)** | ❌ (401) | ✅ | ✅ | ✅ | ✅ |

---

### Default Development Credentials
| Role | Email | Password | Scope |
| :--- | :--- | :--- | :--- |
| **Ministry Admin** | `ministry.admin@gov.in` | `Admin@123456` | National (All 36 States/UTs) |
| **State Nodal Authority** | `state.mh@gov.in` | `State@123456` | Maharashtra State |
| **State Nodal Authority** | `state.up@gov.in` | `State@123456` | Uttar Pradesh State |
| **District Authority** | `district.pune@gov.in` | `District@123456` | Pune District |
| **District Authority** | `district.varanasi@gov.in` | `District@123456` | Varanasi District |
| **Member of Parliament** | `mp.pune@sansad.nic.in` | `Mp@123456` | Pune PC (Lok Sabha) |
| **Member of Parliament** | `mp.varanasi@sansad.nic.in` | `Mp@123456` | Varanasi PC (Lok Sabha) |
