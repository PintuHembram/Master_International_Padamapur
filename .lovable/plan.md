

## Plan: Add Student Results Page

### What we'll build
A modern, user-friendly **Student Results** page where visitors can look up exam results. The page will include:

- **Search by roll number or student name** with a clean search bar
- **Filter by class and exam type** (e.g., Annual, Mid-Term, Unit Test)
- **Results display** in a well-designed card/table format showing subject-wise marks, grade, percentage, and pass/fail status
- **Sample data** to demonstrate the layout (since no results table exists in the database yet)
- **Print/Download** button for result cards
- Modern design consistent with the rest of the site

### Changes

1. **Create `src/pages/StudentResults.tsx`**
   - Hero section with title and description
   - Search bar (roll number or name)
   - Filter dropdowns (class, exam type, academic year)
   - Results card with student info, subject-wise marks table, total, percentage, grade, and rank
   - Print-friendly styling
   - Responsive layout

2. **Update `src/App.tsx`**
   - Add route `/results` pointing to the new page

3. **Update `src/components/Footer.tsx`**
   - Replace the "Results" link `href: "/academics#results"` with `href: "/results"` in the academics links section so it points to the new dedicated page

