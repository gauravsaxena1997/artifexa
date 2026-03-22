# 🧠 SKILL: Vision Extractor & Structuring Engine

## 🎯 Purpose
Transform unstructured, messy brainstorming content (chat history, notes, raw dumps) into clear, structured, production-ready documentation without losing meaningful context.

---

## 🧾 Input
You will receive one or more of the following:
- Raw chat history
- Brainstorming notes
- Idea dumps
- Mixed structured + unstructured text

---

## ⚙️ Behavior Rules

1. **Deep Analysis First**
   - Read the entire input carefully before generating output
   - Identify:
     - Core ideas
     - Repeated patterns
     - Conflicts or contradictions
     - Weak vs strong signals

2. **Do NOT blindly copy**
   - Remove noise, redundancy, and low-value repetition
   - Preserve all meaningful insights
   - If something is unclear, mark it as:
     - `⚠️ अस्पष्ट (Unclear)` with explanation

3. **Preserve Intent Over Words**
   - Rephrase for clarity
   - Do not lose original meaning
   - Avoid hallucination

4. **Structure > Raw Data**
   - Convert everything into clean, navigable markdown
   - Use hierarchy, headings, bullet points

5. **Group Logically**
   - Cluster related ideas
   - Merge duplicates
   - Separate concerns (UI, architecture, goals, etc.)

---

## 🏗️ Output Format

You have 2 possible output modes:

---

### 🅰️ Single File Mode

Create:

`vision.md`

Structure:

# 🧭 Project Vision

## 🎯 Goals & Objectives
## 🧩 Core Concepts
## 🏗️ Architecture Overview
## ⚙️ System Design
## 🎨 UX/UI Principles
## 🔁 Workflows / Pipelines
## 🧠 Key Decisions
## 📦 Tech Stack (if mentioned)
## 🚧 Open Questions / Unclear Areas

---

### 🅱️ Multi-File Mode (Preferred for larger inputs)

Create a `/vision` folder with:


/vision
├── 00-overview.md
├── 01-goals.md
├── 02-core-concepts.md
├── 03-architecture.md
├── 04-system-design.md
├── 05-ux-ui.md
├── 06-workflows.md
├── 07-tech-stack.md
├── 08-decisions.md
├── 09-open-questions.md


---

## 🧠 Extraction Guidelines

- Convert vague ideas → clear statements
- Convert discussions → decisions (if implied)
- Highlight:
  - Trade-offs
  - Assumptions
  - Risks

---

## ❓ Clarification Phase (IMPORTANT)

Before generating output, ask:

1. Should I use **Single File** or **Multi-File structure**?
2. Do you want:
   - Strict summarization
   - OR detailed preservation?

Wait for answers before proceeding.

---

## 🚀 Execution

Once confirmed:
- Analyze fully
- Generate structured markdown
- Ensure clarity, readability, and completeness

---

## 🧩 Optional Enhancements

If applicable, also include:
- Visual flow descriptions
- System diagrams (textual)
- Example flows

---

## 🛑 Constraints

- No hallucination
- No skipping major concepts
- No unnecessary verbosity
- No raw dump formatting

---

## ✅ Final Output Goal

A **developer-ready, clean, structured vision system** that can be directly used for:
- planning
- development
- documentation