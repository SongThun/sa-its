import type { User, Course } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'john.doe@example.com',
    firstName: 'John',
    lastName: 'Doe',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=John',
    bio: 'Passionate learner interested in web development and data science.',
    enrolledCourses: ['1', '3'],
    completedLessons: ['1-1-1', '1-1-2', '1-2-1', '3-1-1'],
    createdAt: '2024-01-15',
  },
  {
    id: '2',
    email: 'jane.smith@example.com',
    firstName: 'Jane',
    lastName: 'Smith',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jane',
    bio: 'Software engineer exploring new technologies.',
    enrolledCourses: ['2'],
    completedLessons: ['2-1-1'],
    createdAt: '2024-02-20',
  },
];

export const mockCourses: Course[] = [
  {
    id: '1',
    title: 'Introduction to Web Development',
    description: 'Learn the fundamentals of web development including HTML, CSS, and JavaScript. This comprehensive course will take you from beginner to confident web developer. You will build real-world projects and gain hands-on experience with modern web technologies.',
    instructor: 'Dr. Sarah Johnson',
    thumbnail: 'https://images.unsplash.com/photo-1461749280684-dccba630e2f6?w=400&h=250&fit=crop',
    duration: '12 hours',
    level: 'Beginner',
    category: 'Web Development',
    rating: 4.8,
    studentsCount: 15420,
    lastAccessed: '2024-11-20',
    modules: [
      {
        id: '1-1',
        title: 'Getting Started with HTML',
        description: 'Learn the basics of HTML structure and elements',
        lessons: [
          {
            id: '1-1-1',
            title: 'Introduction to HTML',
            type: 'video',
            duration: '15 min',
            content: {
              videoUrl: 'https://www.youtube.com/embed/UB1O30fR-EE',
              text: 'HTML (HyperText Markup Language) is the standard markup language for creating web pages. It describes the structure of a web page and consists of a series of elements that tell the browser how to display content.',
            },
          },
          {
            id: '1-1-2',
            title: 'HTML Elements and Tags',
            type: 'text',
            duration: '20 min',
            content: {
              text: `# HTML Elements and Tags

HTML elements are the building blocks of HTML pages. An HTML element is defined by a start tag, some content, and an end tag.

## Basic Structure

\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>Page Title</title>
</head>
<body>
    <h1>My First Heading</h1>
    <p>My first paragraph.</p>
</body>
</html>
\`\`\`

## Common Elements

- **Headings**: \`<h1>\` to \`<h6>\` define headings
- **Paragraphs**: \`<p>\` defines a paragraph
- **Links**: \`<a>\` defines a hyperlink
- **Images**: \`<img>\` defines an image
- **Divisions**: \`<div>\` defines a section

## Attributes

HTML elements can have attributes that provide additional information:

\`\`\`html
<a href="https://example.com">Visit Example</a>
<img src="image.jpg" alt="Description">
\`\`\`

Practice creating your own HTML page with these elements!`,
            },
          },
          {
            id: '1-1-3',
            title: 'HTML Forms',
            type: 'text',
            duration: '25 min',
            content: {
              text: `# HTML Forms

Forms are essential for collecting user input on websites.

## Basic Form Structure

\`\`\`html
<form action="/submit" method="POST">
    <label for="name">Name:</label>
    <input type="text" id="name" name="name">

    <label for="email">Email:</label>
    <input type="email" id="email" name="email">

    <button type="submit">Submit</button>
</form>
\`\`\`

## Input Types

- \`text\` - Single-line text input
- \`email\` - Email address input
- \`password\` - Password input (masked)
- \`number\` - Numeric input
- \`checkbox\` - Checkbox
- \`radio\` - Radio button
- \`submit\` - Submit button`,
            },
          },
        ],
      },
      {
        id: '1-2',
        title: 'CSS Fundamentals',
        description: 'Style your web pages with CSS',
        lessons: [
          {
            id: '1-2-1',
            title: 'Introduction to CSS',
            type: 'video',
            duration: '18 min',
            content: {
              videoUrl: 'https://www.youtube.com/embed/yfoY53QXEnI',
              text: 'CSS (Cascading Style Sheets) is used to style and layout web pages. It controls colors, fonts, spacing, and the overall visual presentation of HTML elements.',
            },
          },
          {
            id: '1-2-2',
            title: 'CSS Selectors and Properties',
            type: 'text',
            duration: '22 min',
            content: {
              text: `# CSS Selectors and Properties

## Types of Selectors

### Element Selector
\`\`\`css
p {
    color: blue;
}
\`\`\`

### Class Selector
\`\`\`css
.highlight {
    background-color: yellow;
}
\`\`\`

### ID Selector
\`\`\`css
#header {
    font-size: 24px;
}
\`\`\`

## Common Properties

- \`color\` - Text color
- \`background-color\` - Background color
- \`font-size\` - Font size
- \`margin\` - Outer spacing
- \`padding\` - Inner spacing
- \`border\` - Element border`,
            },
          },
        ],
      },
      {
        id: '1-3',
        title: 'JavaScript Basics',
        description: 'Add interactivity with JavaScript',
        lessons: [
          {
            id: '1-3-1',
            title: 'Introduction to JavaScript',
            type: 'video',
            duration: '20 min',
            content: {
              videoUrl: 'https://www.youtube.com/embed/W6NZfCO5SIk',
              text: 'JavaScript is a programming language that enables interactive web pages. It is an essential part of web applications.',
            },
          },
          {
            id: '1-3-2',
            title: 'Variables and Data Types',
            type: 'text',
            duration: '25 min',
            content: {
              text: `# Variables and Data Types in JavaScript

## Declaring Variables

\`\`\`javascript
// Using let (recommended for variables that change)
let name = "John";

// Using const (for constants)
const PI = 3.14159;

// Using var (older syntax)
var age = 25;
\`\`\`

## Data Types

1. **String**: Text data
2. **Number**: Numeric values
3. **Boolean**: true or false
4. **Array**: List of values
5. **Object**: Key-value pairs
6. **Undefined**: No value assigned
7. **Null**: Intentional absence of value

## Examples

\`\`\`javascript
let message = "Hello, World!";  // String
let count = 42;                  // Number
let isActive = true;             // Boolean
let colors = ["red", "green"];   // Array
let person = { name: "John" };   // Object
\`\`\``,
            },
          },
        ],
      },
    ],
  },
  {
    id: '2',
    title: 'Python for Data Science',
    description: 'Master Python programming for data analysis and machine learning. Learn pandas, NumPy, and scikit-learn to analyze data and build predictive models. Perfect for aspiring data scientists.',
    instructor: 'Prof. Michael Chen',
    thumbnail: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=400&h=250&fit=crop',
    duration: '20 hours',
    level: 'Intermediate',
    category: 'Data Science',
    rating: 4.9,
    studentsCount: 23150,
    modules: [
      {
        id: '2-1',
        title: 'Python Fundamentals Review',
        description: 'Quick review of Python basics',
        lessons: [
          {
            id: '2-1-1',
            title: 'Python Syntax Refresher',
            type: 'text',
            duration: '30 min',
            content: {
              text: `# Python Syntax Refresher

## Variables and Types

\`\`\`python
# Variables
name = "Alice"
age = 30
height = 5.6
is_student = True

# Lists
fruits = ["apple", "banana", "cherry"]

# Dictionaries
person = {"name": "Bob", "age": 25}
\`\`\`

## Control Flow

\`\`\`python
# If statements
if age >= 18:
    print("Adult")
else:
    print("Minor")

# Loops
for fruit in fruits:
    print(fruit)

while count > 0:
    count -= 1
\`\`\`

## Functions

\`\`\`python
def greet(name):
    return f"Hello, {name}!"

result = greet("Alice")
\`\`\``,
            },
          },
          {
            id: '2-1-2',
            title: 'Working with NumPy',
            type: 'video',
            duration: '45 min',
            content: {
              videoUrl: 'https://www.youtube.com/embed/QUT1VHiLmmI',
              text: 'NumPy is the fundamental package for scientific computing in Python. It provides support for arrays, matrices, and mathematical functions.',
            },
          },
        ],
      },
      {
        id: '2-2',
        title: 'Data Analysis with Pandas',
        description: 'Learn to manipulate and analyze data',
        lessons: [
          {
            id: '2-2-1',
            title: 'Introduction to Pandas',
            type: 'video',
            duration: '40 min',
            content: {
              videoUrl: 'https://www.youtube.com/embed/vmEHCJofslg',
              text: 'Pandas is a powerful data manipulation library that provides data structures and functions needed to manipulate structured data.',
            },
          },
          {
            id: '2-2-2',
            title: 'DataFrames and Series',
            type: 'text',
            duration: '35 min',
            content: {
              text: `# DataFrames and Series

## Creating a DataFrame

\`\`\`python
import pandas as pd

data = {
    'Name': ['Alice', 'Bob', 'Charlie'],
    'Age': [25, 30, 35],
    'City': ['NYC', 'LA', 'Chicago']
}

df = pd.DataFrame(data)
print(df)
\`\`\`

## Basic Operations

\`\`\`python
# Select column
df['Name']

# Filter rows
df[df['Age'] > 25]

# Group by
df.groupby('City').mean()

# Sort
df.sort_values('Age', ascending=False)
\`\`\``,
            },
          },
        ],
      },
    ],
  },
  {
    id: '3',
    title: 'React.js Complete Guide',
    description: 'Build modern web applications with React. Learn components, hooks, state management, and best practices. Create responsive and dynamic user interfaces.',
    instructor: 'Emily Rodriguez',
    thumbnail: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop',
    duration: '16 hours',
    level: 'Intermediate',
    category: 'Web Development',
    rating: 4.7,
    studentsCount: 18900,
    lastAccessed: '2024-11-22',
    modules: [
      {
        id: '3-1',
        title: 'React Fundamentals',
        description: 'Core concepts of React',
        lessons: [
          {
            id: '3-1-1',
            title: 'What is React?',
            type: 'video',
            duration: '12 min',
            content: {
              videoUrl: 'https://www.youtube.com/embed/Tn6-PIqc4UM',
              text: 'React is a JavaScript library for building user interfaces. It lets you compose complex UIs from small and isolated pieces of code called components.',
            },
          },
          {
            id: '3-1-2',
            title: 'Components and JSX',
            type: 'text',
            duration: '25 min',
            content: {
              text: `# Components and JSX

## What is JSX?

JSX is a syntax extension for JavaScript that lets you write HTML-like markup inside JavaScript.

\`\`\`jsx
const element = <h1>Hello, World!</h1>;
\`\`\`

## Function Components

\`\`\`jsx
function Welcome(props) {
    return <h1>Hello, {props.name}</h1>;
}

// Usage
<Welcome name="Alice" />
\`\`\`

## Component Composition

\`\`\`jsx
function App() {
    return (
        <div>
            <Header />
            <MainContent />
            <Footer />
        </div>
    );
}
\`\`\``,
            },
          },
          {
            id: '3-1-3',
            title: 'Props and State',
            type: 'text',
            duration: '30 min',
            content: {
              text: `# Props and State

## Props

Props are inputs to components, passed from parent to child.

\`\`\`jsx
function Greeting({ name, age }) {
    return (
        <div>
            <p>Name: {name}</p>
            <p>Age: {age}</p>
        </div>
    );
}

<Greeting name="John" age={25} />
\`\`\`

## State

State is data that changes over time within a component.

\`\`\`jsx
import { useState } from 'react';

function Counter() {
    const [count, setCount] = useState(0);

    return (
        <div>
            <p>Count: {count}</p>
            <button onClick={() => setCount(count + 1)}>
                Increment
            </button>
        </div>
    );
}
\`\`\``,
            },
          },
        ],
      },
      {
        id: '3-2',
        title: 'React Hooks',
        description: 'Master React Hooks',
        lessons: [
          {
            id: '3-2-1',
            title: 'useState and useEffect',
            type: 'video',
            duration: '35 min',
            content: {
              videoUrl: 'https://www.youtube.com/embed/O6P86uwfdR0',
              text: 'useState and useEffect are the two most commonly used React hooks. useState manages state, while useEffect handles side effects.',
            },
          },
          {
            id: '3-2-2',
            title: 'Custom Hooks',
            type: 'text',
            duration: '28 min',
            content: {
              text: `# Custom Hooks

Custom hooks let you extract component logic into reusable functions.

## Creating a Custom Hook

\`\`\`jsx
import { useState, useEffect } from 'react';

function useWindowSize() {
    const [size, setSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight
    });

    useEffect(() => {
        const handleResize = () => {
            setSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    return size;
}

// Usage
function MyComponent() {
    const { width, height } = useWindowSize();
    return <p>Window: {width} x {height}</p>;
}
\`\`\``,
            },
          },
        ],
      },
    ],
  },
  {
    id: '4',
    title: 'Machine Learning Fundamentals',
    description: 'Understand the core concepts of machine learning. Learn supervised and unsupervised learning, model evaluation, and deployment strategies.',
    instructor: 'Dr. Alex Kim',
    thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=400&h=250&fit=crop',
    duration: '25 hours',
    level: 'Advanced',
    category: 'Data Science',
    rating: 4.6,
    studentsCount: 12300,
    modules: [
      {
        id: '4-1',
        title: 'Introduction to ML',
        description: 'Core ML concepts',
        lessons: [
          {
            id: '4-1-1',
            title: 'What is Machine Learning?',
            type: 'video',
            duration: '20 min',
            content: {
              videoUrl: 'https://www.youtube.com/embed/ukzFI9rgwfU',
              text: 'Machine learning is a subset of artificial intelligence that enables systems to learn and improve from experience without being explicitly programmed.',
            },
          },
        ],
      },
    ],
  },
  {
    id: '5',
    title: 'UI/UX Design Principles',
    description: 'Learn the fundamentals of user interface and user experience design. Create beautiful, intuitive designs that users love.',
    instructor: 'Lisa Park',
    thumbnail: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=400&h=250&fit=crop',
    duration: '10 hours',
    level: 'Beginner',
    category: 'Design',
    rating: 4.5,
    studentsCount: 8700,
    modules: [
      {
        id: '5-1',
        title: 'Design Fundamentals',
        description: 'Basic design principles',
        lessons: [
          {
            id: '5-1-1',
            title: 'Introduction to UI Design',
            type: 'video',
            duration: '15 min',
            content: {
              videoUrl: 'https://www.youtube.com/embed/c9Wg6Cb_YlU',
              text: 'UI design focuses on the look and feel of the user interface, including layout, colors, typography, and visual hierarchy.',
            },
          },
        ],
      },
    ],
  },
  {
    id: '6',
    title: 'Cloud Computing with AWS',
    description: 'Master Amazon Web Services and cloud architecture. Learn to deploy scalable applications and manage cloud infrastructure.',
    instructor: 'David Wilson',
    thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=400&h=250&fit=crop',
    duration: '18 hours',
    level: 'Intermediate',
    category: 'Cloud Computing',
    rating: 4.8,
    studentsCount: 11200,
    modules: [
      {
        id: '6-1',
        title: 'AWS Fundamentals',
        description: 'Introduction to AWS services',
        lessons: [
          {
            id: '6-1-1',
            title: 'AWS Overview',
            type: 'video',
            duration: '25 min',
            content: {
              videoUrl: 'https://www.youtube.com/embed/a9__D53WsUs',
              text: 'Amazon Web Services offers a broad set of global cloud-based products including compute, storage, databases, analytics, and more.',
            },
          },
        ],
      },
    ],
  },
];
