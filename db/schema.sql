CREATE TABlE sunshine (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sector VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    first_name VARCHAR(255) NOT NULL,
    salary DECIMAL NOT NULL,
    taxable_benefits DECIMAL NOT NULL,
    employer VARCHAR(255) NOT NULL,
    title VARCHAR(255) NOT NULL,
    calendar_year INTEGER NOT NULL
);