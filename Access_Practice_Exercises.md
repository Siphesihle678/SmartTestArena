<<<<<<< HEAD
# Microsoft Access Practice Exercises
**Grade 11 CAT - Cycle Test Preparation**

## Exercise 1: Student Database Creation
**Objective:** Create a complete student management database

### Step 1: Table Design
Create the following tables with proper field types:

**Students Table:**
- StudentID (AutoNumber, Primary Key)
- FirstName (Text, 50 characters)
- LastName (Text, 50 characters)
- DateOfBirth (Date/Time)
- Grade (Number, Integer)
- Email (Text, 100 characters)
- PhoneNumber (Text, 20 characters)

**Subjects Table:**
- SubjectID (AutoNumber, Primary Key)
- SubjectName (Text, 100 characters)
- SubjectCode (Text, 10 characters)

**Grades Table:**
- GradeID (AutoNumber, Primary Key)
- StudentID (Number, Foreign Key)
- SubjectID (Number, Foreign Key)
- TestScore (Number, Decimal)
- TestDate (Date/Time)
- TestType (Text, 20 characters)

### Step 2: Relationships
- Create relationships between Students and Grades (One-to-Many)
- Create relationships between Subjects and Grades (One-to-Many)
- Enforce referential integrity

### Step 3: Data Entry
Add sample data:
- 5 students with complete information
- 3 subjects (Mathematics, English, CAT)
- 15 grade records (5 students × 3 subjects)

## Exercise 2: Query Practice

### Query 1: Basic Select
Create a query that shows:
- Student full name (concatenated)
- Subject name
- Test score
- Test date
- Only for tests scored above 70%

### Query 2: Parameter Query
Create a query that:
- Prompts for a subject name
- Shows all students and their scores for that subject
- Sorts by score (highest first)

### Query 3: Calculated Field
Create a query that:
- Shows student name and subject
- Calculates the average score per student per subject
- Only includes students with more than 2 tests per subject

### Query 4: Crosstab Query
Create a crosstab query that:
- Shows students as row headers
- Shows subjects as column headers
- Shows average scores as values

## Exercise 3: Form Design

### Form 1: Student Entry Form
Create a form that:
- Allows easy entry of new students
- Includes validation rules:
  - Email must contain "@"
  - Phone number must be 10 digits
  - Grade must be between 8 and 12
- Has a professional layout with proper spacing

### Form 2: Grade Entry Form
Create a form that:
- Uses a combo box to select students
- Uses a combo box to select subjects
- Includes a date picker for test date
- Validates that scores are between 0 and 100
- Shows the student's name when selected

## Exercise 4: Report Creation

### Report 1: Student Performance Report
Create a report that:
- Groups by student
- Shows all subjects and scores
- Calculates average score per student
- Includes a summary section
- Has professional formatting

### Report 2: Subject Analysis Report
Create a report that:
- Groups by subject
- Shows all students and their scores
- Calculates class average per subject
- Shows highest and lowest scores
- Includes charts/graphs if possible

## Exercise 5: Advanced Features

### Macro 1: Navigation
Create a macro that:
- Opens the student entry form
- Maximizes the window
- Sets focus to the first field

### Macro 2: Data Validation
Create a macro that:
- Validates email format
- Shows error message if invalid
- Prevents form submission if errors exist

## Cycle Test Practice Questions

### Question 1: Database Design
"Design a database for a school library system. Include tables for books, students, and loans. Show the relationships and field types."

### Question 2: Query Writing
"Write a query to find all students who borrowed more than 3 books in the last month."

### Question 3: Form Design
"Design a form for entering new book loans. Include validation rules and explain your design choices."

### Question 4: Report Creation
"Create a report showing overdue books. Include student details and fine calculations."

## Sample Data Sets

### Library Database Sample Data
**Books Table:**
- BookID, Title, Author, ISBN, Category, Available

**Students Table:**
- StudentID, Name, Grade, Email, Phone

**Loans Table:**
- LoanID, BookID, StudentID, LoanDate, DueDate, ReturnDate

### Sample Data Entries:
```
Books:
1, "To Kill a Mockingbird", "Harper Lee", "978-0-06-112008-4", "Fiction", Yes
2, "1984", "George Orwell", "978-0-452-28423-4", "Fiction", Yes
3, "The Great Gatsby", "F. Scott Fitzgerald", "978-0-7432-7356-5", "Fiction", No

Students:
1, "John Smith", 11, "john.smith@school.com", "0821234567"
2, "Sarah Johnson", 11, "sarah.j@school.com", "0839876543"
3, "Mike Wilson", 10, "mike.w@school.com", "0845551234"

Loans:
1, 1, 1, 2025-08-01, 2025-08-15, NULL
2, 2, 2, 2025-08-05, 2025-08-19, 2025-08-18
3, 3, 1, 2025-08-10, 2025-08-24, NULL
```

## Practice Scenarios

### Scenario 1: School Sports Database
Design a database to track:
- Students and their sports teams
- Match results and scores
- Player statistics
- Team rankings

### Scenario 2: Online Store Database
Design a database to track:
- Products and categories
- Customers and orders
- Order details and shipping
- Inventory management

### Scenario 3: Hospital Management System
Design a database to track:
- Patients and medical history
- Doctors and specializations
- Appointments and treatments
- Billing and payments

## Assessment Criteria

### Excellent (80-100%)
- All tables properly designed with correct relationships
- Queries work correctly and efficiently
- Forms are user-friendly with proper validation
- Reports are well-formatted and informative
- Advanced features implemented correctly

### Good (60-79%)
- Most tables designed correctly
- Basic queries work properly
- Forms function with some validation
- Reports are functional but basic
- Some advanced features implemented

### Satisfactory (40-59%)
- Basic table structure correct
- Simple queries work
- Basic forms created
- Simple reports generated
- Limited advanced features

### Needs Improvement (Below 40%)
- Tables have design issues
- Queries don't work properly
- Forms are incomplete
- Reports are missing or incorrect
- No advanced features

## Tips for Success

### Before Starting
1. **Plan your database design** - sketch out tables and relationships
2. **Test your design** - create small sample data first
3. **Save frequently** - Access can be unpredictable
4. **Use meaningful names** - for tables, fields, and objects

### During Development
1. **Test as you go** - don't wait until the end
2. **Use wizards first** - then customize as needed
3. **Keep it simple** - don't overcomplicate
4. **Document your work** - add comments and notes

### Before Submission
1. **Test everything** - run all queries and forms
2. **Check relationships** - ensure referential integrity
3. **Validate data** - make sure all rules work
4. **Backup your work** - save multiple copies

## Common Mistakes to Avoid

### Database Design
- ❌ Forgetting primary keys
- ❌ Not setting up relationships
- ❌ Using wrong field types
- ❌ Not considering data validation

### Queries
- ❌ Forgetting to save queries
- ❌ Not testing with sample data
- ❌ Complex criteria that don't work
- ❌ Not using proper field names

### Forms
- ❌ Poor layout and spacing
- ❌ Missing validation rules
- ❌ Not user-friendly design
- ❌ Forgetting to test data entry

### Reports
- ❌ Poor formatting
- ❌ Missing calculations
- ❌ Not grouping properly
- ❌ Incomplete information

---

=======
# Microsoft Access Practice Exercises
**Grade 11 CAT - Cycle Test Preparation**

## Exercise 1: Student Database Creation
**Objective:** Create a complete student management database

### Step 1: Table Design
Create the following tables with proper field types:

**Students Table:**
- StudentID (AutoNumber, Primary Key)
- FirstName (Text, 50 characters)
- LastName (Text, 50 characters)
- DateOfBirth (Date/Time)
- Grade (Number, Integer)
- Email (Text, 100 characters)
- PhoneNumber (Text, 20 characters)

**Subjects Table:**
- SubjectID (AutoNumber, Primary Key)
- SubjectName (Text, 100 characters)
- SubjectCode (Text, 10 characters)

**Grades Table:**
- GradeID (AutoNumber, Primary Key)
- StudentID (Number, Foreign Key)
- SubjectID (Number, Foreign Key)
- TestScore (Number, Decimal)
- TestDate (Date/Time)
- TestType (Text, 20 characters)

### Step 2: Relationships
- Create relationships between Students and Grades (One-to-Many)
- Create relationships between Subjects and Grades (One-to-Many)
- Enforce referential integrity

### Step 3: Data Entry
Add sample data:
- 5 students with complete information
- 3 subjects (Mathematics, English, CAT)
- 15 grade records (5 students × 3 subjects)

## Exercise 2: Query Practice

### Query 1: Basic Select
Create a query that shows:
- Student full name (concatenated)
- Subject name
- Test score
- Test date
- Only for tests scored above 70%

### Query 2: Parameter Query
Create a query that:
- Prompts for a subject name
- Shows all students and their scores for that subject
- Sorts by score (highest first)

### Query 3: Calculated Field
Create a query that:
- Shows student name and subject
- Calculates the average score per student per subject
- Only includes students with more than 2 tests per subject

### Query 4: Crosstab Query
Create a crosstab query that:
- Shows students as row headers
- Shows subjects as column headers
- Shows average scores as values

## Exercise 3: Form Design

### Form 1: Student Entry Form
Create a form that:
- Allows easy entry of new students
- Includes validation rules:
  - Email must contain "@"
  - Phone number must be 10 digits
  - Grade must be between 8 and 12
- Has a professional layout with proper spacing

### Form 2: Grade Entry Form
Create a form that:
- Uses a combo box to select students
- Uses a combo box to select subjects
- Includes a date picker for test date
- Validates that scores are between 0 and 100
- Shows the student's name when selected

## Exercise 4: Report Creation

### Report 1: Student Performance Report
Create a report that:
- Groups by student
- Shows all subjects and scores
- Calculates average score per student
- Includes a summary section
- Has professional formatting

### Report 2: Subject Analysis Report
Create a report that:
- Groups by subject
- Shows all students and their scores
- Calculates class average per subject
- Shows highest and lowest scores
- Includes charts/graphs if possible

## Exercise 5: Advanced Features

### Macro 1: Navigation
Create a macro that:
- Opens the student entry form
- Maximizes the window
- Sets focus to the first field

### Macro 2: Data Validation
Create a macro that:
- Validates email format
- Shows error message if invalid
- Prevents form submission if errors exist

## Cycle Test Practice Questions

### Question 1: Database Design
"Design a database for a school library system. Include tables for books, students, and loans. Show the relationships and field types."

### Question 2: Query Writing
"Write a query to find all students who borrowed more than 3 books in the last month."

### Question 3: Form Design
"Design a form for entering new book loans. Include validation rules and explain your design choices."

### Question 4: Report Creation
"Create a report showing overdue books. Include student details and fine calculations."

## Sample Data Sets

### Library Database Sample Data
**Books Table:**
- BookID, Title, Author, ISBN, Category, Available

**Students Table:**
- StudentID, Name, Grade, Email, Phone

**Loans Table:**
- LoanID, BookID, StudentID, LoanDate, DueDate, ReturnDate

### Sample Data Entries:
```
Books:
1, "To Kill a Mockingbird", "Harper Lee", "978-0-06-112008-4", "Fiction", Yes
2, "1984", "George Orwell", "978-0-452-28423-4", "Fiction", Yes
3, "The Great Gatsby", "F. Scott Fitzgerald", "978-0-7432-7356-5", "Fiction", No

Students:
1, "John Smith", 11, "john.smith@school.com", "0821234567"
2, "Sarah Johnson", 11, "sarah.j@school.com", "0839876543"
3, "Mike Wilson", 10, "mike.w@school.com", "0845551234"

Loans:
1, 1, 1, 2025-08-01, 2025-08-15, NULL
2, 2, 2, 2025-08-05, 2025-08-19, 2025-08-18
3, 3, 1, 2025-08-10, 2025-08-24, NULL
```

## Practice Scenarios

### Scenario 1: School Sports Database
Design a database to track:
- Students and their sports teams
- Match results and scores
- Player statistics
- Team rankings

### Scenario 2: Online Store Database
Design a database to track:
- Products and categories
- Customers and orders
- Order details and shipping
- Inventory management

### Scenario 3: Hospital Management System
Design a database to track:
- Patients and medical history
- Doctors and specializations
- Appointments and treatments
- Billing and payments

## Assessment Criteria

### Excellent (80-100%)
- All tables properly designed with correct relationships
- Queries work correctly and efficiently
- Forms are user-friendly with proper validation
- Reports are well-formatted and informative
- Advanced features implemented correctly

### Good (60-79%)
- Most tables designed correctly
- Basic queries work properly
- Forms function with some validation
- Reports are functional but basic
- Some advanced features implemented

### Satisfactory (40-59%)
- Basic table structure correct
- Simple queries work
- Basic forms created
- Simple reports generated
- Limited advanced features

### Needs Improvement (Below 40%)
- Tables have design issues
- Queries don't work properly
- Forms are incomplete
- Reports are missing or incorrect
- No advanced features

## Tips for Success

### Before Starting
1. **Plan your database design** - sketch out tables and relationships
2. **Test your design** - create small sample data first
3. **Save frequently** - Access can be unpredictable
4. **Use meaningful names** - for tables, fields, and objects

### During Development
1. **Test as you go** - don't wait until the end
2. **Use wizards first** - then customize as needed
3. **Keep it simple** - don't overcomplicate
4. **Document your work** - add comments and notes

### Before Submission
1. **Test everything** - run all queries and forms
2. **Check relationships** - ensure referential integrity
3. **Validate data** - make sure all rules work
4. **Backup your work** - save multiple copies

## Common Mistakes to Avoid

### Database Design
- ❌ Forgetting primary keys
- ❌ Not setting up relationships
- ❌ Using wrong field types
- ❌ Not considering data validation

### Queries
- ❌ Forgetting to save queries
- ❌ Not testing with sample data
- ❌ Complex criteria that don't work
- ❌ Not using proper field names

### Forms
- ❌ Poor layout and spacing
- ❌ Missing validation rules
- ❌ Not user-friendly design
- ❌ Forgetting to test data entry

### Reports
- ❌ Poor formatting
- ❌ Missing calculations
- ❌ Not grouping properly
- ❌ Incomplete information

---

>>>>>>> 19f6c55cb05b175c418cb6d48927185fe0445c97
**Remember:** Practice makes perfect! Work through these exercises multiple times until you're comfortable with each concept. The more you practice, the more confident you'll be for the cycle test. 