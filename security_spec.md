# Firestore Security Specification - Mazen Portfolio

This security specification details the access control policies, data invariants, and potential attack vectors designed against Mazen's ultra-premium developer portfolio backend.

## 1. Data Invariants
- **Public Readability**: The public must be able to view projects, skills, services, testimonials, social links, and text configurations without authenticating.
- **Admin Isolation**: Only pre-defined Google accounts (`motaem23@gmail.com`, `motaem23y@gmail.com`) can modify, delete, or add data in the Firestore database.
- **Verification Guarantee**: Every admin request must verify that `email_verified` is true to protect against malicious email-spoofing attacks.

## 2. Dynamic Vulnerability Vectors Tested ("The Dirty Dozen")
1. **Unauthenticated Project Deletion**: Anonymous requests attempting to delete or overwrite showcase projects.
2. **Standard Authentication Privilege Escalation**: A random logged-in Google account trying to add or edit skills.
3. **Admin Email Spoofing**: A malicious account with self-declared or unverified `email: motaem23@gmail.com` but `email_verified: false` attempting to update content.
4. **Project Injection/Resource Poisoning**: Massive payload size injections in the title or casework fields.
5. **No-Match Global Read/Write**: Attempting to query non-existent or administrative system collections.
6. **Skills Hijacking**: Writing custom records into `/skills/` to inject malware or fake tags.
7. **Social link modification**: Redirecting Portfolio contact buttons to phishing domains by editing `/socialLinks/`.
8. **Service Card Deletion**: Overwriting services to clear out portfolio presentation blocks.
9. **Testimonials Defacement**: Creating obscene fake reviews.
10. **Temporal Integrity Decay**: Forging static modification times.
11. **ID Character Exploitation**: Attempting path poisoning with long control sequences.
12. **Null-Pointer operations**: Reads/writes designed to trigger system exceptions in rules evaluation.

## 3. Security Rules Architecture (Draft Implementation)
The rules are designed to default-deny all root paths and explicitly permit:
- Read access unconditionally for standard lists.
- Write access (create/update/delete) exclusively for the verified admin account.
