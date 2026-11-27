# Phase 5 — Industrial discovery interview framework

**Document version:** `gryps-industrial-discovery-interview-framework-v0`  
**Task:** ENG-02 (preparation only)  
**Recorded:** 2026-11-26  
**Status:** Neutral problem-discovery guide. **Not** a questionnaire to validate a GRYPS score.

## Purpose

Support voluntary conversations that explore operational connectivity requirements, infrastructure dependencies and constraints at remote industrial sites — without assuming GRYPS is correct, useful or complete.

## Framing rules

| Do | Do not |
| --- | --- |
| Describe GRYPS as non-commercial research / prototype | Pitch a product, certification or procurement tool |
| Ask how the site actually works | Ask them to endorse methodology or a Signature |
| Treat “I don’t know” as a first-class answer | Force independence conclusions |
| Separate interviewee belief from verified fact | Record marketing claims as confirmed architecture |
| Stop when the participant declines a topic | Probe for credentials, configs or security-sensitive detail |

Opening script (when later authorised): research purpose · voluntary · no commercial commitment · right to skip · no recording without consent · notes may be anonymised.

---

## 1. Site and operational context

1. What makes this site geographically or operationally remote?  
2. Which operations depend on communications (safety, production, maintenance, reporting)?  
3. Are operations stationary, mobile, underground, distributed across multiple locations — or mixed?  
4. How do connectivity requirements vary across the site (pit vs plant, underground vs surface, field machines vs control room)?  
5. Which processes can continue offline, and for how long?

---

## 2. Current connectivity

1. What connectivity technologies are used today (fibre, microwave, public mobile, private LTE/5G, Wi-Fi, radio, satellite, other)?  
2. Which of those are primary for OT vs IT vs voice/safety?  
3. Are satellite links used at all? If yes — for what traffic class? If no — why not?  
4. What are the main limitations (coverage, latency, weather, capacity, handover, underground penetration, vendor lock-in)?  
5. Are primary and backup connections available? Who defines “backup”?  
6. Has the technology mix changed in the last five years? What drove the change?

**Caution:** Do not assume remote location ⇒ satellite. Do not infer dual independence from two brand names.

---

## 3. Dependencies and resilience

1. What happens when connectivity is lost (for 1 s, 1 min, 1 h, 1 day)?  
2. What are the operational, safety and economic consequences?  
3. Do backup connections share power, towers, gateways, backhaul, PoPs, control rooms or vendors?  
4. Who in the organisation would know whether connections are genuinely independent — and who would not?  
5. Which dependencies are documented? Which are assumed? Which are unknown?  
6. How are shared failure modes discussed in design reviews or HAZOP-like processes (if at all)?

**Recording rule:** Interviewee statements = participant statements. Promote to site-confirmed only under P5-S5 rules with provenance.

---

## 4. Decision-making

1. Who specifies connectivity requirements (operations, OT, IT, EPC, OEM, telecom partner)?  
2. When in project development are connectivity decisions locked (concept, FEED, construction, operations)?  
3. What information is available before equipment or service procurement?  
4. What uncertainties are hardest to resolve before signing contracts?  
5. How are vendor independence claims checked — if they are checked?

---

## 5. Research relevance (no score validation)

1. Would an independent assessment of **infrastructure dependencies** be useful to your organisation? Why or why not?  
2. Which information would such an assessment need that you cannot get from vendors alone?  
3. Which conclusions would be **unacceptable** without direct site or measurement evidence?  
4. What would make a research assessment misleading or irrelevant for operators?  
5. What non-sensitive information could you imagine sharing under a research agreement — and what would never leave the site?

**Explicitly forbidden asks in discovery interviews:**

- “Does our Signature of N · X look right?”  
- “Will you endorse GRYPS?”  
- “Confirm that Starlink and OneWeb are independent here.”  
- Requests for passwords, configs, firewall rules, SIM credentials, detailed network diagrams for public use.

---

## 6. Closing

1. Who else should we talk to (role, not private email)?  
2. Preferred organisational channel for any follow-up?  
3. Interest in a defined, voluntary next step (none / another call / written Q&A / later site evidence under gates)?  
4. Any topics to exclude from notes?

---

## After the interview (holder process)

| Step | Action |
| --- | --- |
| Classify | public fact / participant statement / lead / unknown |
| Do not | Upgrade to site-confirmed or measurement without P5-S5 |
| Do not | Feed statements into Model v0.4 scoring as validation |
| Do not | Mix with Phase 3 REVIEW findings register |
| Gate | Any evidence request → P5-S4 approval checklist |
