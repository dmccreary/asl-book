# Content Generation Guidelines

This document defines the rules, standards, and conventions for generating content for this intelligent textbook. All content creators (human or AI) must follow these guidelines to maintain pedagogical integrity, visual styling, and consistency.

---

## 1. General Markdown & MkDocs Conventions

### List Spacing
* **Always place a blank line before any markdown list.** This is required for proper parsing by MkDocs and Python-Markdown extensions.
  
  *Correct:*
  ```markdown
  Here are the prerequisites:

  * No prior sign language experience needed
  * Comfortable with group activities
  ```

  *Incorrect:*
  ```markdown
  Here are the prerequisites:
  * No prior sign language experience needed
  * Comfortable with group activities
  ```

### File & Path Conventions
* **Navigation updates**: After adding any `.md` file to `docs/`, register its path in the `nav:` list inside `mkdocs.yml`.
* **Kebab-case filenames**: Use kebab-case for all files (e.g., `course-description.md`, `concept-list.md`).
* **Title Case labels**: Concept labels must be in Title Case and limited to a **maximum of 32 characters**.

---

## 2. Educational Frameworks & Quality Standards

### Bloom's Taxonomy (2001 Revision)
Content must actively target all six cognitive levels of Bloom's Taxonomy, color-coded for visual grouping:
1. **Remember (Red)**: Retrieve, recognize, and recall relevant knowledge (e.g. letters, numbers, signs).
2. **Understand (Orange)**: Summarize, explain, and classify concepts (e.g. why facial grammar matters).
3. **Apply (Yellow)**: Implement and use signs in conversational prompts, skits, and partner activities.
4. **Analyze (Green)**: Differentiate, compare, and organize structures (e.g. comparing signed vs. spoken grammar).
5. **Evaluate (Blue)**: Judge, critique, and assess (e.g. reflecting on communication accessibility).
6. **Create (Purple)**: Design, construct, and perform (e.g. writing and performing mini-dialogues).

### Content Quality Standards
* **Prerequisites**: Teach prerequisite concepts first, respecting the dependency paths defined in the learning graph.
* **Worked Examples**: Include at least 2–3 worked examples or signed dialogues per section.
* **Practice Exercises**: Provide 5–8 practice exercises or interactive activities per section.
* **Tone**: Maintain an encouraging, positive, and inclusive tone designed to support students with diverse learning styles (ADHD, dyslexia, etc.).

---

## 3. Mascot Inclusion Rules (Mimi the Chameleon)

**Mimi the Chameleon** is the textbook's pedagogical agent, representing expressive, visual-spatial communication. Mimi guides students through tips, warnings, thinking breaks, and chapter milestones.

### Mascot File Index
The canonical mascot files are located under:

| File | Purpose |
| :--- | :--- |
| `docs/img/mascot/neutral.png` | General-purpose pose / sidebar illustration |
| `docs/img/mascot/welcome.png` | Chapter overview / welcoming pose |
| `docs/img/mascot/thinking.png` | Key insight / reflection question pose |
| `docs/img/mascot/tip.png` | "Mimi's Tip" / helpful signing hints pose |
| `docs/img/mascot/warning.png` | Pitfall / common mistake alerts pose |
| `docs/img/mascot/encouragement.png` | Supportive "You got this!" pose |
| `docs/img/mascot/celebration.png` | Milestones and chapter completion pose |
| `docs/css/extra.css` | Admonition styling and dimensions |
| `docs/learning-graph/mascot-test.md` | Test rendering page for mascot styles |

### Character Specifications
* **Name**: Mimi (gender-neutral)
* **Species**: Chameleon
* **Personality**: Creative, expressive, friendly, supportive, curious
* **Catchphrase**: *"Watch the movement, feel the sign!"*
* **Visual Identity**: A green/teal chameleon with colorful stripes, big expressive eyes, a curled tail, and clean outlines.

### Voice & Language
* Use gender-neutral pronouns (`they/them`) when referring to Mimi.
* Keep dialogue brief and focused (1–3 sentences).
* Include Mimi's catchphrase in chapter welcome boxes.

### Admonition Syntax & Layout
Mimi must always be floated to the left inside the admonition box body using Markdown image class syntax (never in the title bar):

```markdown
!!! mascot-tip "Mimi's Tip"
    ![Mimi Tip](../../img/mascot/tip.png){ class="mascot-admonition-img" }
    Always make direct eye contact with the person you are signing to. Looking away is considered impolite in Deaf culture!
```

### Placement & Restraint Guidelines
To prevent distraction and maintain visual flow:
* **Mascot Cap**: Limit mascot appearances to a **maximum of 5–6 times per chapter**.
* **No Back-to-Back**: Never place two mascot admonitions directly adjacent to each other. They must be separated by standard chapter prose or headings.
* **Sentence Limit**: Mascot dialogue in callout boxes must be **between 1 and 3 sentences** (target is 2 sentences).
* **Relative Paths**: Always check your directory depth when linking images. For standard chapters at `chapters/chapter-name/index.md`, the relative path is `../../img/mascot/`.
