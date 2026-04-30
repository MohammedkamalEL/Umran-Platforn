# Security Specification - Campaign Participation Tracking

## 1. Data Invariants
- A participation record MUST be linked to a valid user ID (matching the authenticated user).
- A participation record MUST be linked to a valid campaign ID.
- The `type` must be either 'join' or 'sponsor'.
- The `pointsEarned` must be a positive integer matching the logic (100 for join, 500 for sponsor).
- If `type` is 'sponsor', `amount` must be present and >= 1000 SDG.
- Users cannot join the same campaign more than once as type='join'. (Handled via document ID as userId or campaignId).
- `createdAt` must be the server time.

## 2. The "Dirty Dozen" Payloads

1. **Identity Theft (Create):** User A tries to create a participation record for User B.
2. **Identity Theft (Update):** User A tries to modify User B's participation record.
3. **Point Injection:** User tries to create a participation record earning 1,000,000 points.
4. **Amount Spoofing:** User sponsors a project with a negative amount.
5. **Campaign Poisoning:** User tries to update campaign progress/funds without creating a participation record (handled via batch/atomic checks).
6. **Double Joining:** User tries to create a second "join" record for the same campaign to farm points.
7. **Role Escalation:** User tries to set their role to 'official' in their profile when joining a campaign.
8. **Stat Tampering:** User tries to decrement the campaign participant count.
9. **Orphaned Participation:** User tries to join a campaign that doesn't exist.
10. **Time Travel:** User providing a past or future `createdAt` timestamp.
11. **Malicious ID:** User using a 1MB string as a campaign ID or participation ID to cause resource exhaustion.
12. **PII Leak:** An unauthenticated user tries to list all participations and see user IDs.

## 3. Test Cases (Summary)
- `PERMISSION_DENIED` when `request.auth.uid != userId`.
- `PERMISSION_DENIED` when `incoming().pointsEarned > 500`.
- `PERMISSION_DENIED` when `incoming().createdAt != request.time`.
- `PERMISSION_DENIED` when `incoming().type == 'sponsor' && !incoming().hasAll(['amount'])`.
- `PERMISSION_DENIED` when attempting to update fields in `campaigns/{id}` other than `participantCount`, `sponsorCount`, `currentAmount`, and `progress` during a participation action.
