# Microsoft Access Quick Reference Guide
**Grade 11 CAT - Essential Commands & Procedures**

## Database Fundamentals

### Creating a New Database
1. **File → New → Blank Database**
2. **Choose location and name**
3. **Click Create**

### Opening an Existing Database
1. **File → Open**
2. **Browse to database file (.accdb)**
3. **Click Open**

## Table Design

### Creating Tables
1. **Create tab → Table Design**
2. **Add field names and data types**
3. **Set primary key (right-click field → Primary Key)**
4. **Save table (Ctrl+S)**

### Common Field Types
- **Text:** Names, addresses, short text
- **Number:** Scores, quantities, calculations
- **Date/Time:** Birth dates, due dates
- **Currency:** Money values
- **Yes/No:** True/false, yes/no
- **AutoNumber:** Automatic ID numbers
- **Memo:** Long text (notes, descriptions)

### Field Properties
- **Field Size:** Limit text length
- **Required:** Must have a value
- **Default Value:** Pre-filled value
- **Validation Rule:** Data validation
- **Validation Text:** Error message

## Relationships

### Creating Relationships
1. **Database Tools → Relationships**
2. **Add tables to relationship window**
3. **Drag primary key to foreign key**
4. **Check "Enforce Referential Integrity"**
5. **Save relationships**

### Relationship Types
- **One-to-One:** One record in Table A matches one in Table B
- **One-to-Many:** One record in Table A matches many in Table B
- **Many-to-Many:** Requires junction table

## Queries

### Creating Select Queries
1. **Create tab → Query Design**
2. **Add tables to query**
3. **Select fields to display**
4. **Add criteria if needed**
5. **Run query (F5)**

### Common Criteria Operators
- **=** Equal to
- **<>** Not equal to
- **>** Greater than
- **<** Less than
- **>=** Greater than or equal to
- **<=** Less than or equal to
- **Like** Pattern matching
- **Between** Range of values
- **In** List of values
- **Is Null** Empty values
- **Is Not Null** Non-empty values

### Calculated Fields
- **Syntax:** `FieldName: Expression`
- **Examples:**
  - `FullName: [FirstName] & " " & [LastName]`
  - `Age: DateDiff("yyyy",[BirthDate],Date())`
  - `Total: [Quantity] * [Price]`

### Parameter Queries
- **Criteria:** `[Enter Student Name:]`
- **Prompt appears when query runs**

### Crosstab Queries
1. **Create tab → Query Wizard → Crosstab**
2. **Select row headers**
3. **Select column headers**
4. **Select values**
5. **Choose aggregation function**

## Forms

### Creating Forms
1. **Create tab → Form Wizard**
2. **Select table/query**
3. **Choose fields**
4. **Select layout**
5. **Choose style**
6. **Name and finish**

### Form Design View
1. **Right-click form → Design View**
2. **Add controls from Design tab**
3. **Set properties in Property Sheet**
4. **Save form**

### Common Form Controls
- **Text Box:** Data entry
- **Label:** Static text
- **Combo Box:** Dropdown selection
- **List Box:** Multiple selection
- **Check Box:** Yes/No values
- **Option Group:** Multiple choice
- **Command Button:** Actions
- **Subform:** Related data

### Form Properties
- **Record Source:** Data source
- **Allow Additions:** Add new records
- **Allow Deletions:** Delete records
- **Allow Edits:** Edit records
- **Data Entry:** Add new records only

## Reports

### Creating Reports
1. **Create tab → Report Wizard**
2. **Select table/query**
3. **Choose fields**
4. **Select grouping**
5. **Choose layout and style**
6. **Name and finish**

### Report Sections
- **Report Header:** Title, date, logo
- **Page Header:** Column titles
- **Group Header:** Group titles
- **Detail:** Data records
- **Group Footer:** Group summaries
- **Page Footer:** Page numbers
- **Report Footer:** Grand totals

### Report Calculations
- **Sum:** `=Sum([FieldName])`
- **Average:** `=Avg([FieldName])`
- **Count:** `=Count([FieldName])`
- **Maximum:** `=Max([FieldName])`
- **Minimum:** `=Min([FieldName])`

## Macros

### Creating Macros
1. **Create tab → Macro**
2. **Add actions from dropdown**
3. **Set action arguments**
4. **Save macro**

### Common Macro Actions
- **OpenForm:** Open a form
- **OpenReport:** Open a report
- **OpenQuery:** Run a query
- **GoToRecord:** Navigate records
- **SetValue:** Set field values
- **MessageBox:** Show message
- **Beep:** Sound alert
- **QuitAccess:** Close database

### Macro Conditions
- **Syntax:** `[FieldName] = "Value"`
- **Examples:**
  - `[Score] >= 70`
  - `[Status] = "Active"`
  - `IsNull([Email])`

## Data Import/Export

### Importing Data
1. **External Data tab → Import**
2. **Choose file type (Excel, Text, etc.)**
3. **Browse to file**
4. **Follow import wizard**
5. **Choose import options**

### Exporting Data
1. **External Data tab → Export**
2. **Choose format (Excel, PDF, etc.)**
3. **Select destination**
4. **Choose export options**

## Keyboard Shortcuts

### General
- **Ctrl+S:** Save
- **Ctrl+Z:** Undo
- **Ctrl+Y:** Redo
- **F5:** Run query
- **F6:** Switch panes
- **F11:** Toggle navigation pane

### Navigation
- **Tab:** Next field
- **Shift+Tab:** Previous field
- **Enter:** Next record
- **Shift+Enter:** Previous record
- **Ctrl+Home:** First record
- **Ctrl+End:** Last record

### Design View
- **F4:** Property sheet
- **F5:** Run
- **F6:** Switch between panes
- **Ctrl+0:** Hide/Show field list

## Common Error Messages

### "Cannot add or change a record because a related record is required"
- **Solution:** Check referential integrity
- **Fix:** Add related record first

### "The changes you requested to the table were not successful"
- **Solution:** Check field types and sizes
- **Fix:** Adjust field properties

### "Type mismatch in expression"
- **Solution:** Check data types
- **Fix:** Use proper field types

### "The expression you entered has a function containing the wrong number of arguments"
- **Solution:** Check function syntax
- **Fix:** Verify function parameters

## Best Practices

### Database Design
- ✅ Use meaningful table and field names
- ✅ Set appropriate field types
- ✅ Create primary keys for all tables
- ✅ Establish proper relationships
- ✅ Use validation rules

### Queries
- ✅ Test with sample data
- ✅ Use clear field names
- ✅ Save queries with descriptive names
- ✅ Document complex queries

### Forms
- ✅ Design for user-friendliness
- ✅ Include validation rules
- ✅ Test all data entry scenarios
- ✅ Use consistent layout

### Reports
- ✅ Include all necessary information
- ✅ Use proper grouping
- ✅ Add calculations where needed
- ✅ Test printing format

## Troubleshooting

### Database Won't Open
1. **Check file location**
2. **Verify file isn't corrupted**
3. **Try compact and repair**
4. **Check permissions**

### Queries Don't Work
1. **Check table relationships**
2. **Verify field names**
3. **Test criteria syntax**
4. **Check for null values**

### Forms Show Errors
1. **Check record source**
2. **Verify field names**
3. **Test validation rules**
4. **Check macro actions**

### Reports Are Empty
1. **Check record source**
2. **Verify query works**
3. **Check grouping settings**
4. **Test with sample data**

---

**Remember:** Practice these procedures regularly. The more familiar you are with Access, the more confident you'll be during the cycle test! 