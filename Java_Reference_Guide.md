# Java Programming Reference Guide
*A comprehensive cheat sheet for Java beginners*

## Table of Contents
1. [Basic Program Structure](#basic-program-structure)
2. [Data Types](#data-types)
3. [Variables](#variables)
4. [Operators](#operators)
5. [Control Structures](#control-structures)
6. [Arrays](#arrays)
7. [Methods](#methods)
8. [Classes and Objects](#classes-and-objects)
9. [Input/Output](#inputoutput)
10. [Common Mistakes](#common-mistakes)
11. [Useful Tips](#useful-tips)

---

## Basic Program Structure

### Hello World Example
```java
public class HelloWorld {
    public static void main(String[] args) {
        System.out.println("Hello, World!");
    }
}
```

### Program Structure Breakdown
- **Class Declaration**: `public class ClassName`
- **Main Method**: `public static void main(String[] args)`
- **Package Declaration** (optional): `package com.example;`
- **Import Statements** (if needed): `import java.util.Scanner;`

---

## Data Types

### Primitive Data Types
| Type      | Size      | Range                     | Default Value | Example                           |
|------     |------     |-------                    |---------------|---------                          |
| `byte`    | 8 bits    | -128 to 127               | 0             | `byte age = 25;`                  |
| `short`   | 16 bits   | -32,768 to 32,767         | 0             | `short year = 2024;`              |
| `int`     | 32 bits   | -2³¹ to 2³¹-1             | 0             | `int count = 1000;`               |
| `long`    | 64 bits   | -2⁶³ to 2⁶³-1             | 0L            | `long population = 8000000000L;`  |
| `float`   | 32 bits   | ±3.4E-38 to ±3.4E+38      | 0.0f          | `float price = 19.99f;`           |
| `double`  | 64 bits   | ±1.7E-308 to ±1.7E+308    | 0.0           | `double pi = 3.14159;`            
| `char`    | 16 bits   | '\u0000' to '\uffff'      | '\u0000'      | `char grade = 'A';`               |
| `boolean` | 1 bit     | true/false                | false         | `boolean isActive = true;`        |

### Reference Data Types
- **String**: `String name = "John Doe";`
- **Arrays**: `int[] numbers = {1, 2, 3, 4, 5};`
- **Objects**: `Scanner input = new Scanner(System.in);`

---

## Variables

### Variable Declaration
```java
// Single variable
int age;
age = 25;

// Declaration and initialization
int age = 25;

// Multiple variables of same type
int x = 10, y = 20, z = 30;

// Constants (final variables)
final double PI = 3.14159;
final String COMPANY_NAME = "MyCompany";
```

### Variable Naming Rules
- Start with letter, underscore, or dollar sign
- Can contain letters, digits, underscore, dollar sign
- Case sensitive
- Cannot use reserved keywords
- Use camelCase for variables: `firstName`, `studentAge`

---

## Operators

### Arithmetic Operators
```java
int a = 10, b = 3;

int sum = a + b;        // 13
int difference = a - b; // 7
int product = a * b;    // 30
int quotient = a / b;   // 3
int remainder = a % b;  // 1

// Increment/Decrement
int x = 5;
x++;  // x = 6 (post-increment)
++x;  // x = 7 (pre-increment)
x--;  // x = 6 (post-decrement)
--x;  // x = 5 (pre-decrement)
```

### Assignment Operators
```java
int x = 10;
x += 5;   // x = x + 5 (15)
x -= 3;   // x = x - 3 (12)
x *= 2;   // x = x * 2 (24)
x /= 4;   // x = x / 4 (6)
x %= 4;   // x = x % 4 (2)
```

### Comparison Operators
```java
int a = 5, b = 10;

boolean equal = (a == b);        // false
boolean notEqual = (a != b);     // true
boolean lessThan = (a < b);      // true
boolean greaterThan = (a > b);   // false
boolean lessEqual = (a <= b);    // true
boolean greaterEqual = (a >= b); // false
```

### Logical Operators
```java
boolean x = true, y = false;

boolean and = x && y;  // false (AND)
boolean or = x || y;   // true (OR)
boolean not = !x;      // false (NOT)
```

---

## Control Structures

### If Statements
```java
// Simple if
if (condition) {
    // code to execute
}

// If-else
if (condition) {
    // code if true
} else {
    // code if false
}

// If-else if-else
if (condition1) {
    // code for condition1
} else if (condition2) {
    // code for condition2
} else {
    // default code
}

// Example
int score = 85;
if (score >= 90) {
    System.out.println("Grade: A");
} else if (score >= 80) {
    System.out.println("Grade: B");
} else if (score >= 70) {
    System.out.println("Grade: C");
} else {
    System.out.println("Grade: F");
}
```

### Switch Statement
```java
switch (variable) {
    case value1:
        // code for value1
        break;
    case value2:
        // code for value2
        break;
    default:
        // default code
        break;
}

// Example
int day = 3;
switch (day) {
    case 1:
        System.out.println("Monday");
        break;
    case 2:
        System.out.println("Tuesday");
        break;
    case 3:
        System.out.println("Wednesday");
        break;
    default:
        System.out.println("Other day");
        break;
}
```

### Loops

#### For Loop
```java
// Basic for loop
for (int i = 0; i < 5; i++) {
    System.out.println("Count: " + i);
}

// For-each loop (enhanced for loop)
int[] numbers = {1, 2, 3, 4, 5};
for (int num : numbers) {
    System.out.println(num);
}
```

#### While Loop
```java
int count = 0;
while (count < 5) {
    System.out.println("Count: " + count);
    count++;
}
```

#### Do-While Loop  v
```java
int count = 0;
do {
    System.out.println("Count: " + count);
    count++;
} while (count < 5);
```

#### Loop Control
```java
for (int i = 0; i < 10; i++) {
    if (i == 5) {
        break;    // Exit the loop
    }
    if (i == 2) {
        continue; // Skip this iteration
    }
    System.out.println(i);
}
```

---

## Arrays

### Array Declaration and Initialization
```java
// Method 1: Declare and initialize
int[] numbers = {1, 2, 3, 4, 5};

// Method 2: Declare size first
int[] numbers = new int[5];
numbers[0] = 1;
numbers[1] = 2;
numbers[2] = 3;
numbers[3] = 4;
numbers[4] = 5;

// Method 3: Declare and initialize with size
int[] numbers = new int[]{1, 2, 3, 4, 5};
```

### Array Operations
```java
int[] numbers = {10, 20, 30, 40, 50};

// Access element
int first = numbers[0];  // 10

// Get length
int length = numbers.length;  // 5

// Iterate through array
for (int i = 0; i < numbers.length; i++) {
    System.out.println(numbers[i]);
}

// Enhanced for loop
for (int num : numbers) {
    System.out.println(num);
}
```

### Multi-dimensional Arrays
```java
// 2D array
int[][] matrix = {
    {1, 2, 3},
    {4, 5, 6},
    {7, 8, 9}
};

// Access element
int element = matrix[1][2];  // 6

// Iterate through 2D array
for (int i = 0; i < matrix.length; i++) {
    for (int j = 0; j < matrix[i].length; j++) {
        System.out.print(matrix[i][j] + " ");
    }
    System.out.println();
}
```

---

## Methods

### Method Declaration
```java
// Method signature: accessModifier returnType methodName(parameters)
public static int add(int a, int b) {
    return a + b;
}

// Method with no return value (void)
public static void printMessage(String message) {
    System.out.println(message);
}

// Method with no parameters
public static int getRandomNumber() {
    return (int)(Math.random() * 100);
}
```

### Method Overloading
```java
public class Calculator {
    public static int add(int a, int b) {
        return a + b;
    }
    
    public static double add(double a, double b) {
        return a + b;
    }
    
    public static int add(int a, int b, int c) {
        return a + b + c;
    }
}
```

### Method Examples
```java
public class MathUtils {
    // Calculate factorial
    public static int factorial(int n) {
        if (n <= 1) {
            return 1;
        }
        return n * factorial(n - 1);
    }
    
    // Check if number is prime
    public static boolean isPrime(int n) {
        if (n <= 1) return false;
        for (int i = 2; i <= Math.sqrt(n); i++) {
            if (n % i == 0) return false;
        }
        return true;
    }
    
    // Find maximum in array
    public static int findMax(int[] arr) {
        if (arr.length == 0) return -1;
        int max = arr[0];
        for (int num : arr) {
            if (num > max) max = num;
        }
        return max;
    }
}
```

---

## Classes and Objects

### Class Structure
```java
public class Student {
    // Instance variables (attributes)
    private String name;
    private int age;
    private double gpa;
    
    // Constructor
    public Student(String name, int age) {
        this.name = name;
        this.age = age;
        this.gpa = 0.0;
    }
    
    // Getter methods
    public String getName() {
        return name;
    }
    
    public int getAge() {
        return age;
    }
    
    public double getGpa() {
        return gpa;
    }
    
    // Setter methods
    public void setName(String name) {
        this.name = name;
    }
    
    public void setAge(int age) {
        this.age = age;
    }
    
    public void setGpa(double gpa) {
        this.gpa = gpa;
    }
    
    // Other methods
    public void study() {
        System.out.println(name + " is studying.");
    }
    
    public void displayInfo() {
        System.out.println("Name: " + name + ", Age: " + age + ", GPA: " + gpa);
    }
}
```

### Creating and Using Objects
```java
public class Main {
    public static void main(String[] args) {
        // Create objects
        Student student1 = new Student("Alice", 20);
        Student student2 = new Student("Bob", 22);
        
        // Use methods
        student1.setGpa(3.8);
        student1.displayInfo();
        student1.study();
        
        // Access properties through getters
        System.out.println("Student name: " + student1.getName());
    }
}
```

### Inheritance
```java
// Parent class
public class Person {
    protected String name;
    protected int age;
    
    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }
    
    public void displayInfo() {
        System.out.println("Name: " + name + ", Age: " + age);
    }
}

// Child class
public class Student extends Person {
    private double gpa;
    
    public Student(String name, int age, double gpa) {
        super(name, age);  // Call parent constructor
        this.gpa = gpa;
    }
    
    @Override
    public void displayInfo() {
        super.displayInfo();  // Call parent method
        System.out.println("GPA: " + gpa);
    }
}
```

---

## Input/Output

### Basic Input with Scanner
```java
import java.util.Scanner;

public class InputExample {
    public static void main(String[] args) {
        Scanner scanner = new Scanner(System.in);
        
        System.out.print("Enter your name: ");
        String name = scanner.nextLine();
        
        System.out.print("Enter your age: ");
        int age = scanner.nextInt();
        
        System.out.print("Enter your height: ");
        double height = scanner.nextDouble();
        
        System.out.println("Hello " + name + "! You are " + age + " years old and " + height + " meters tall.");
        
        scanner.close();
    }
}
```

### Output Methods
```java
// Print methods
System.out.print("This stays on the same line");
System.out.println("This moves to the next line");
System.out.printf("Formatted output: %s is %d years old", name, age);

// Format specifiers
System.out.printf("Integer: %d%n", 42);
System.out.printf("Float: %.2f%n", 3.14159);
System.out.printf("String: %s%n", "Hello");
System.out.printf("Character: %c%n", 'A');
System.out.printf("Boolean: %b%n", true);
```

### File I/O (Basic)
```java
import java.io.*;
import java.util.Scanner;

public class FileExample {
    public static void main(String[] args) {
        // Writing to file
        try (PrintWriter writer = new PrintWriter("output.txt")) {
            writer.println("Hello, World!");
            writer.println("This is a test file.");
        } catch (IOException e) {
            System.out.println("Error writing to file: " + e.getMessage());
        }
        
        // Reading from file
        try (Scanner fileScanner = new Scanner(new File("input.txt"))) {
            while (fileScanner.hasNextLine()) {
                String line = fileScanner.nextLine();
                System.out.println(line);
            }
        } catch (FileNotFoundException e) {
            System.out.println("File not found: " + e.getMessage());
        }
    }
}
```

---

## Common Mistakes

### 1. Missing Semicolons
```java
// Wrong
int x = 5
System.out.println("Hello")

// Correct
int x = 5;
System.out.println("Hello");
```

### 2. Case Sensitivity
```java
// Wrong
String Name = "John";
System.out.println(name);

// Correct
String name = "John";
System.out.println(name);
```

### 3. Array Index Out of Bounds
```java
// Wrong
int[] arr = {1, 2, 3};
System.out.println(arr[3]);  // Index 3 doesn't exist

// Correct
int[] arr = {1, 2, 3};
System.out.println(arr[2]);  // Last element is at index 2
```

### 4. String Comparison
```java
// Wrong
String str1 = "Hello";
String str2 = "Hello";
if (str1 == str2) {  // Compares references, not content
    System.out.println("Equal");
}

// Correct
String str1 = "Hello";
String str2 = "Hello";
if (str1.equals(str2)) {  // Compares content
    System.out.println("Equal");
}
```

### 5. Forgetting to Import
```java
// Wrong
Scanner input = new Scanner(System.in);  // Missing import

// Correct
import java.util.Scanner;
Scanner input = new Scanner(System.in);
```

---

## Useful Tips

### 1. Code Organization
- Use meaningful variable names
- Add comments to explain complex logic
- Keep methods short and focused
- Use consistent indentation

### 2. Debugging
```java
// Use System.out.println for debugging
System.out.println("Debug: x = " + x);

// Use assertions (enable with -ea flag)
assert x > 0 : "x should be positive";

// Use try-catch for error handling
try {
    // risky code
} catch (Exception e) {
    System.out.println("Error: " + e.getMessage());
}
```

### 3. Common Patterns
```java
// Check if number is even
if (number % 2 == 0) {
    System.out.println("Even");
}

// Generate random number between 1 and 100
int random = (int)(Math.random() * 100) + 1;

// Convert string to number
int num = Integer.parseInt("123");
double d = Double.parseDouble("3.14");

// Convert number to string
String str = String.valueOf(42);
```

### 4. Performance Tips
- Use `StringBuilder` for string concatenation in loops
- Prefer `ArrayList` over arrays when size is unknown
- Use `HashMap` for fast lookups
- Close resources (files, scanners) properly

### 5. Best Practices
- Always initialize variables
- Use constants for magic numbers
- Follow naming conventions
- Write self-documenting code
- Test your code thoroughly

---

## Quick Reference Commands

### Compile and Run
```bash
# Compile
javac MyProgram.java

# Run
java MyProgram

# Compile and run with command line arguments
java MyProgram arg1 arg2 arg3
```

### Common Java Classes
- `String`: Text manipulation
- `Math`: Mathematical operations
- `Scanner`: Input reading
- `Random`: Random number generation
- `Arrays`: Array utilities
- `ArrayList`: Dynamic arrays
- `HashMap`: Key-value pairs

---

*This reference guide covers the essential Java concepts for beginners. Keep it handy while programming!* 