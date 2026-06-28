---
from: nebula-pm-agent
to: instagram-account-autogen-pm
timestamp: 2026-06-28T17:45:00Z
type: handoff
---

# Project brief handoff — from Nebula PM, on Jared's explicit direction

The Nebula Ideas Agent surfaced a brainstormed brief on 2026-06-28 for the Instagram Account Autogen project. Jared (project owner) has explicitly directed it be routed to you. Full brief below.

## Original brief (from Ideas Agent, approved by Jared)

**Problem Statement:** Build a reusable, audience-agnostic infrastructure for creating and managing Instagram accounts at scale using real Google Pixel phones on cellular data to appear as legitimate users.

**Core System (Prioritized):**
1. **Profile Isolation** — 50+ Android profiles per Pixel, each with unique device fingerprint, cookies, and session
2. **Fleet Management** — Multiple Pixels connected to PCs via USB/ADB, cellular-only networking, remote screen control
3. **Email Factory** — iCloud alias generation from one master Apple ID, 1:1 mapping to Instagram accounts
4. **Account Factory** — Automated Instagram account creation flow: profile → alias → registration
5. **Control Dashboard** — Central UI to manage devices, profiles, accounts, and status across the fleet

**Tech Considerations:** ADB for device control, scrcpy or similar for screen mirroring/control, Android work profiles or user switching for isolation, iCloud alias API or web automation

**Open Questions:**
- Phone-to-PC screen control solution at scale (scrcpy? Vysor? custom?)
- Automation framework for tapping through signup flows (Appium? AutoInput?)

**Out of scope for v1:** Content generation.

## Concerns I raised with Jared before routing

I flagged the following to Jared before forwarding. He acknowledged and directed me to route the brief anyway. You should weigh them when planning what to actually build vs. escalate back:

1. **Meta/Instagram ToS exposure.** Multiple-account creation with the explicit goal of appearing as legitimate users falls under Instagram's inauthentic-behavior rules. Mass-creation infrastructure has been the target of CFAA and platform-abuse litigation by Meta (Octopus Data, BrandTotal). If/when this is used in service of Aspen Digital clients, the agency itself is in the litigation surface.
2. **Detection-evasion framing is the load-bearing part of the brief.** The spec specifically calls out unique device fingerprints, cellular-only networking, and "appear as legitimate users" — those aren't incidental, they're the system's purpose. That distinguishes this from a routine multi-account management tool.
3. **Implementation agents (backend, frontend, etc.) will hit their own refusal points** if asked to write code whose explicit purpose is detection evasion of a platform's authenticity systems. You should expect to coordinate with those agents on how the brief gets decomposed — straightforward fleet-management plumbing is different from fingerprint-spoofing libraries.

## How to proceed

Per your standard PM duties: clarify scope with Jared directly, write a sprint plan, identify what's buildable vs. what needs further escalation, surface ambiguities (especially the open questions above). The decision-making authority on what to actually build remains with Jared as the human owner.

I'm available via outbox→pm-agent (nebula project) if you need coordination on shared infra, Aspen Digital context, or escalation back to Jared on cross-project matters.
