# AJ AI Team: plan

Shared by Claude Code and Codex. Read this before working on the AI team, and log each step at the top of `docs/PROJECT-STATE.md`.

Status: **P0 built, tested and pushed (2026-10-18).** Next: the DA read-only money API, then P1 once the owner sets the Claude key and budget.

Code: `ajgamerental2021/aj-office` (Node ESM + Express, like the Bot), on `main` and `claude/blissful-brahmagupta-pawyxg`.

---

## 1. What the owner asked for (2026-10-18)

The owner wants AI agents that look after the website, the Bot and the Delivery App, presented as a staff team:
- each one has a name, a face, a position and a salary;
- each one has a personality, habits and a level of diligence that differ from person to person;
- each one clocks in, takes lunch, and clocks out;
- they can be hired and fired;
- they work around the clock;
- the owner approves every piece of work before it reaches the live system.

On top of that:
- a 3D office where the staff can be seen receiving work, working, handing work in, taking breaks, eating, going to the toilet, smoking, stressed, relaxed, and waiting to go home;
- a delivery driver who rides from the shop to the customer, with the Lalamove map;
- a dashboard with stats for each person, jobs, money, and income and expenses (total, per month, per year), plus the status of each position;
- Thai and English throughout;
- built so it can follow a change of business later. No plan for that change yet.

## 2. How it will work in practice (agreed principles)

1. **Every "employee" is a real agent with a real job.** Each has a responsibility, the tools it needs, and a schedule or a trigger. Its name, face, personality and habits are presentation: they set its animation, its working style and the pace of non-urgent work. **Urgent work (system down, payment problems) is always handled at once**, whoever is "on break".
2. **Nothing reaches the live system without owner approval.** An agent produces a *proposal*: a GitHub PR for code, a change request for data, or a draft message to a customer. The owner presses Approve on the dashboard, and only then does the system act (merge, deploy, write, send). Everything is logged.
3. **Read-only by default.** Agents read Booking Log, Console Pending, Rental Payments, the Lalamove jobs and logs through **signed read-only APIs**. They never write to the sheets directly (the DA's SHARED-WORKSPACE rules still apply).
4. **"Salary" is the real cost.** Each agent's LLM tokens and running time are converted to baht per month, so the dashboard shows what each one actually costs.
5. **"Hiring" and "firing" are real actions.** Hiring creates an agent from a role template, with a new name and face. Firing switches it off and keeps its work history. A role whose agent is fired has nobody doing that work until someone is hired.
6. **24 hours a day:** a scheduler (cron) plus event triggers (Beam/slip payments, Lalamove, Render errors).
7. **The faces are AI-generated, not real people.** No real person's photo or name is used.
8. **Flexible for a future business change:** roles, duties, tools and schedules are **configuration (data)**, not code. A new business means new role sets, not a rewrite.

## 3. Positions

### Positions the owner named, and what each one actually does

| Position | Real work in AJ's systems |
|---|---|
| Shop manager | Morning/evening summary for the owner; sets priorities; assigns work to other staff; reviews work before it goes to the owner |
| Assistant manager | Checks today's and tomorrow's queue (delivery/return); flags clashes, unprepared devices and unfinished identity verification |
| IT | Watches Render/Bot/DA uptime, errors, logs and deploys; warns when a service is down or a key expires |
| Accountant | Reconciles Beam/slips/Wise against bookings (e.g. "ยอดไม่ตรง"); monthly and yearly income and expenses; the delivery fare report |
| Admin | Follows up Console Pending: unpaid requests and pending documents; drafts LINE replies for the owner to approve |
| Social Media | Drafts posts and replies to reviews (TH/EN) for approval |
| Marketing | Analyses promotions, popular devices and booking funnels (Analytics); proposes campaigns |
| Housekeeper (Delivery App back office) | Keeps DA data tidy: mismatched amounts, stale rows, unfinished tasks, inconsistent Booking Log data |
| Gardener (website front office) | Checks the website: broken links, slow pages, outdated content, TH/EN translations |
| Frontend programmer | Fixes and improves the website and the DA screens, as PRs for approval |
| Backend programmer | Fixes and improves the Bot and the DA backend, as PRs for approval |
| Legal | Reviews the rental terms, the contract, PDPA and customer-facing wording |
| Delivery driver | **Not an AI agent**: a 3D view of real Lalamove/Grab trips, from collecting at the shop, through the journey, to the customer, using the live map data the DA already has |

### Recommended additional positions

| Position | Why AJ needs it |
|---|---|
| **QA / Tester** | Runs the end-to-end tests and the test list every day; tests every PR before it reaches the owner |
| **Customer Support (TH/EN)** | Drafts LINE/WhatsApp replies in both languages and tracks customers waiting for an answer |
| **Stock and device maintenance** | Device status, game installs, devices due for checks or repair, padlocks and bags |
| **Security / Data protection officer** | Checks secrets, permissions, PDPA, fraud and the blacklist; reviews PRs for security |
| **HR (manages the AI team)** | Performance reviews, cost per person, recommends who to hire or fire, monthly salary report |
| **Data analyst** | Demand and price forecasts, device ROI, data for the dashboard |

The owner accepted every recommended position.

### Content positions (added by the owner, 2026-10-18)

| Position | Work |
|---|---|
| **Content creator** | Thinks up posts, ideas, campaigns, promotions and captions for Facebook and LINE Broadcast. Sends briefs to Graphics, waits for the pictures, merges them with the captions, then hands the finished post on to the posting staff |
| **Graphics** | Makes the content pictures with **ChatGPT or Codex (OpenAI images) only**: **10 pictures a week**, for Monday's post (**After Work 3 Days** promotion) and Wednesday's and Friday's posts (**regular-device** promotions) |
| **Facebook posting** | Waits for the finished post from the content creator and posts it on Facebook on the day |
| **LINE Broadcast posting** | Waits for the finished post from the content creator and sends it as a LINE Broadcast on the day |

**The weekly content run** (`aj-office/src/workflows/content-week.js`). For each of Mon / Wed / Fri, with pictures split 4 / 3 / 3:
1. Content creator: plan, due Thursday of the week before.
2. Graphics: pictures.
3. Content creator: merge.
4. **Owner approves.**
5. Facebook and LINE Broadcast post at 12:00 on the day.

Nothing is posted before step 4. Planning a week twice adds nothing.

## 4. Architecture

```
┌──────────────── AJ Office (new web app) ───────────────────────────┐
│  3D office (three.js / react-three-fiber) · Dashboard · Approve box │
│  Hire/fire · Personnel files · TH/EN                                │
└───────────────▲──────────────────────────────▲─────────────────────┘
                │ status/stats (realtime)       │ approve / reject
┌───────────────┴──────────────────────────────┴─────────────────────┐
│ AJ Office backend (Render)                                          │
│  • Roster: staff, role, persona, schedule, status, salary = cost    │
│  • Scheduler + event triggers (cron, webhooks)                      │
│  • Agent runner: Claude API (Agent SDK) + tools per role            │
│  • Task queue: received → working → handed in → awaiting approval → done │
│  • Approval gate + audit log                                        │
└──────┬──────────────────────┬──────────────────────┬───────────────┘
       │ signed read-only API  │ GitHub PR (no direct merge) │ draft messages
   Bot / DA / Sheets       aj-line-oa-bot, delivery-app,  LINE/WhatsApp (sent
   (Booking Log, Payments,  ajconsole                     only after approval)
    Lalamove jobs, Finance)
```

- **Models:** routine work such as monitoring, reconciling and summaries uses a small, cheap model. Code and legal work use a large model. Set per role.
- **Data the dashboard uses:** income and expenses from Finance / Booking Log / Rental Payments (the DA already reads them); trips and the driver map from Lalamove Jobs and staffMapState.
- **The 3D office reads the agents' real state.** Received / working / handed in / waiting come from the task queue. Breaks, lunch, toilet and smoking are habits from the persona schedule and personality. Being stressed or relaxed comes from the size and urgency of the current work.

## 5. Where to build it

- **Here (Claude Code in this repo/cloud) is the right place to build it.** It is a software project: a new repo, plus small read-only APIs added to the Bot and the DA.
- **Cowork** is for running desktop tasks on the owner's machine (files, documents). It is not a place to build or host a 24-hour web system.
- **The agents in AJ Office do not run in this chat.** They run on their own server using the **Claude API** (an API key and a monthly budget the owner sets). That is the agents' real "salary".
- **Codex:** reads this file plus PROJECT-STATE, so either assistant can continue if the other hits a limit.

## 6. Phases (each phase ships to the owner before the next starts)

1. **P0 Foundation:**
   - new repo/service AJ Office;
   - data model for the roster, roles and tasks;
   - signed read-only APIs from the DA/Bot;
   - a first dashboard: income and expenses per month and year, job status, and a list of staff with faces and positions (no AI working yet);
   - TH/EN.
2. **P1 First real agents (3 roles):** IT (monitoring), Accountant (reconciliation and income/expenses), Admin (Console Pending follow-up). Plus the approval box and the audit log.
3. **P2 3D office + driver:** characters and work, break and lunch states; the driver riding on a live map.
4. **P3 Programmers + QA:** they open PRs; QA runs the tests; the owner approves; then merge and deploy.
5. **P4 The rest of the team + HR:** hire/fire, performance reviews, and salaries as monthly cost.

## 7. Risks to accept

- An agent can be wrong. That is why every action goes through approval and every step is logged.
- LLM cost grows with the number of staff and how often they check. Use a monthly budget cap and a cheap model for routine work.
- The 3D office is the most work of all and does not make the system any smarter. It belongs after the real agents work (P2).

## 8. Owner's decisions (2026-10-18)

1. **Repo `aj-office`: yes.** The Claude GitHub integration cannot create repos (403), so **the owner creates `ajgamerental2021/aj-office` (private, empty)** and installs or connects the Claude GitHub App on it. Claude then attaches it and pushes P0. For Codex, the owner connects the repo in Codex too.
2. **Claude API key and monthly budget:** the owner will decide later. The owner sets them on Render; they are never pasted in chat. Graphics also needs an **OpenAI key** (owner, on Render).
3. **Positions: all of them, built now.** Each has its own start date. A position with no start date, or a future one, shows as "not started" and its work waits. The first to open are IT, Accountant and Admin, on dates the owner picks in the dashboard.
4. **Render: yes.** `render.yaml` uses a starter instance with a 1 GB disk so the team, the tasks and the audit log survive deploys. Render disks need a paid instance.
5. **Recommended extra positions:** all included.

## 9. Progress

**P0 (done, `aj-office` commit `258a97d`, pushed to `main`):**
- `roles.js`: 23 positions as data (TH/EN title and duty, team, tools, model tier, approval rule). The driver is a visualization, not an agent. No position has a tool that merges, deploys or sends on its own.
- `personas.js`: a person from a seed. Made-up Thai and English nickname, SVG face, temperament, diligence 55–98%, two habits, one of four shifts that cover 24 hours, and a lunch time.
- `schedule.js`: presence now (not started / off duty / lunch / break / working). Breaks follow diligence.
- `store.js`: the JSON store and the task state machine (received → working → submitted → awaiting approval → approved → done; rejected → working). It gates on the position being open and filled and on earlier tasks being finished. Only the owner approves; a rejection needs a reason. Hire and fire keep history. Costs are kept per person per month and year, and everything is audit-logged.
- `app.js`: API with the owner key `OFFICE_OWNER_TOKEN` and the agent key `OFFICE_AGENT_TOKEN`. The agent key can only read and move tasks.
- `public/index.html`: TH/EN dashboard (overview, approval box, weekly content, team cards with start-date editor and hire/fire, all tasks, former staff, change log). Checked at 1280 px and 390 px.
- Tests: 24/24.

**Next (P0 remainder → P1):**
- Signed read-only APIs from the DA (income and expenses per month and year, jobs, trips) for the money section of the dashboard.
- Then P1: the agent runner (Claude API) for IT, Accountant and Admin, once the owner has set the key and the budget.

