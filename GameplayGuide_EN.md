# 📈 SimCorp Simulation —— Complete Gameplay Guide

Welcome to the *SimCorp Simulation*! This is a business simulation game centered around managing a company, employees, and projects. This guide will explain all the systems and gameplay mechanics in detail, helping you grow from scratch into an industry-leading tycoon.

---

## 🎯 1. Game Objectives & Conditions

The core of the game is the dynamic balance of resource management (funds, employees, progress).

### 🏆 Victory Conditions (achieve either):
1. **Financial Freedom**: Company funds reach **$10,000,000**.
2. **Industry Dominance**: Company level reaches **Level 3**, and you successfully complete at least one **TOP-tier** rarity project.

### 💀 Defeat Condition (Bankruptcy):
- Company funds **drop below $0**, **AND** there are **no employees** in the company (all resigned or fired).
*(Note: If your funds are negative but you still have employees working, you can still turn the tide by completing projects!)*

---

## ⏱️ 2. Core Loop: Monthly Settlement

The game progresses in a **turn-based** manner. The **"Next Month"** button in the bottom right is the only way to advance time. Each click triggers the core loop:

1. **Project Progress**: All projects with assigned employees will progress based on the employees' ability stats.
2. **Status Deductions**:
   - Deduct the **monthly salary** of all active employees.
   - Deduct the **monthly maintenance fee** for all equipment.
   - All working employees will have their **stress increased** and **mood decreased**.
   - All equipment will lose **durability**.
3. **Settlement Logic**:
   - If a project reaches 100% progress, you receive a **massive reward** and company experience.
   - If a project exceeds the maximum allowed duration, you will be hit with hefty **overtime penalties**.
   - If an employee's stress exceeds 100 or mood drops below 10, they will **resign immediately**, and you must pay a huge severance package.
   - If an equipment's durability drops to 0, it breaks and requires repair.
4. **Random Events**: There is a **50%** chance every month to trigger a random event. The probability distribution is: 30% Good, 30% Neutral, 40% Bad.
5. **Balance Note**: Due to fierce industry competition, **overall project efficiency has been nerfed by 15%**, and **base stress growth for working employees has been increased by 30%**. You must rely heavily on high-quality employees and equipment buffs to survive.

---

## 🏢 3. Home: Company & Boss System

This is your headquarters as the boss.

### 📊 Company Level & Experience
- Completing projects grants company experience (EXP).
- When experience and funds meet the requirements, you can **upgrade the company** (Max Level 3).
  - **Level 1 to 2**: Requires **500 EXP** and **$300,000** funds.
  - **Level 2 to 3**: Requires **1500 EXP** and **$600,000** funds.
- **Benefits of Upgrading**:
  - Increases the maximum number of employees.
  - Unlocks higher-tier recruitment (Elite, Headhunter).
  - Unlocks rarer and more lucrative projects in the market (SR, SSR, TOP).

### 🧑‍💼 Boss Stats & Actions
Your personal stats affect company operations:
- **Boss Mood**: Affects risk resistance against random events.
- **Boss Ability**: When interacting with employees using high-pressure tactics like "Overtime Crunch", higher boss ability extracts more extra project progress.
- **Boss Actions**: You can spend funds on **[Training]** (boosts ability) or **[Entertainment]** (boosts mood).

---

## 👥 4. Employee System (Core Assets)

Employees are the only tools for making money. You need to recruit, nurture, squeeze, and pacify them.

### 🔍 Talent Acquisition
In the "Employee" page, there are three recruitment methods:
1. **Normal ($500, Level 1)**: Only recruits mediocre Junior employees. *Note: Normal recruitment is completely free during the campus hiring seasons in March and September!*
2. **Elite ($5,000, Level 2)**: High chance of recruiting Medium-level employees with solid stats.
3. **Headhunter ($12,000, Level 3)**: High chance of recruiting Senior or Top-tier talent directly.
4. **Recruitment Limit**: To prevent blind expansion, **all recruitment types are capped at a total of 10 times per month**. Use your job postings wisely.

### 📋 Core Employee Stats
- **Title**: Junior -> Medium -> Senior -> Top. You can spend money to **Promote** employees, significantly boosting their ability and allowing them to tackle more specialized projects.
- **Function/Category**: e.g., Architecture (ARCH), Planning (PLN), Landscape (LAN). Matching the function speeds up project progress.
- **Ability**: Determines how much project progress the employee contributes each month.
- **Mood & Stress**:
  - **Red Line Warning**: Mood < 10 or Stress > 100 means the employee will run away next month!
  - Low mood or high stress inflicts a "slacking" penalty, reducing actual output.
- **Traits**: Passive skills unique to each employee. E.g., "Slacker" (low efficiency), "Resilient" (stress grows slower), "Greedy" (high salary demands).

### 💬 Interaction & Exploitation (INTERACT)
To manage mood and stress, you can interact with them:
- **Chat/Team Building**: Spend money or time to restore mood and lower stress.
- **Overtime Crunch**: Instantly boosts current project progress massively, but mood plummets and stress skyrockets.
- **Raise Salary**: Permanently increases salary but instantly maxes out mood.
- **Specialized Training**: Spend money to permanently increase ability.
- **Paid Leave**: No work this month (0 progress), but massively restores status.

### 🤖 AI Chat System
Click the **[💬 Chat]** button on an employee card to type and talk directly to them!
- Each employee is an independent AI personality. They reply based on their mood, stress, traits, and current project status.
- **Chat is Action**: Your words have real consequences. Encouraging them might boost mood; abusing or pressuring them will spike their stress and tank their mood.

---

## 💼 5. Project System (Main Revenue)

Without projects, the company dies.

### 🛒 Market Bidding
- The **Project Market** refreshes **5** new projects every month, categorized by rarity (R, SR, SSR, TOP).
- Higher rarity means greater rewards but harder completion.
- **Bidding Mechanic**:
  - You must assign an employee whose ability meets the "Minimum Bid Requirement" to bid.
  - **Win Rate**: Not 100% guaranteed. Meeting the exact minimum requirement gives a **60%** win rate. Every extra point of ability adds 0.4%. You only get a 100% win rate if the employee's ability exceeds the requirement by **100 points**.

### ⚙️ Project Execution
- Once accepted, projects enter the "Active" state. You must **[Assign]** idle employees to work on them.
- Multiple employees can work on the same project.
- **Crucial Mechanic: Overtime Penalty**. Every project has a maximum allowed duration (Max Months). If it doesn't reach 100% progress within the time limit, a **penalty will be deducted every month** thereafter until completed. Delayed projects can easily bankrupt you.

---

## 💻 6. Equipment System (Logistical Buffs)

Good tools are prerequisite to the successful execution of a job.

- **Capacity Limit**: Office space is limited; you can only own a maximum of **6** equipment items simultaneously (including broken ones).
- **Selling Equipment**: Unneeded equipment can be **[Sold]** from the inventory. 
  - **Recycle Value**: `(Current Durability / Max Durability) * Original Price`.
- **Durability & Repair**: Equipment loses durability every month. At 0 durability, it breaks and its buffs vanish. You must spend 50% of its original price to **Repair** it. Don't forget to maintain key equipment!

---

## 🎲 7. Roguelite Elements: Talents & Events

### 🌟 Starting Talents
When starting a new game, you roll a random Boss Talent (you can reroll infinitely).
Examples:
- **Rich Kid**: Starting funds doubled.
- **Charismatic Leader**: Employee stress growth is slower.
- **Well-Connected**: High-tier projects appear more frequently.

### ⚡ Random Events
Every 3 months, a random event will definitively trigger.
- **Bad Events**: Industry Winter (increased penalties), Hacker Attack (progress rolled back), Strike.
- **Good Events**: Govt Subsidy (free money), Burst of Inspiration (free progress), Fame Boost.
