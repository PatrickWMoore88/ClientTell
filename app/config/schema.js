const checkQuery = `SELECT
    EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'users') AS users_exists,
    EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'contact_requests') AS contact_exists,
    EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'clients') AS clients_exists,
    EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'projects') AS projects_exists,
    EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'invoices') AS invoices_exists,
    EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'campaigns') AS campaigns_exists,
    EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'leads') AS leads_exists,
    EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'tasks') AS tasks_exists,
    EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'team_members') AS team_exists;
`;

const tableDefinitions = {
    users: `CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY, 
        username VARCHAR(255) NOT NULL, 
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(100) NOT NULL, 
        member_since TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
    contact: `CREATE TABLE contact_requests (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        message TEXT NOT NULL,
        submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
    clients: `CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY, 
        name VARCHAR(255) NOT NULL, 
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20), 
        company_name VARCHAR(255), 
        website_url VARCHAR(255),
        status VARCHAR(50) CHECK (status IN ('Lead', 'Active', 'Inactive')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
    projects: `CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY, 
        client_id INT REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
        name VARCHAR(255) NOT NULL, 
        description TEXT, 
        start_date DATE, 
        deadline DATE,
        status VARCHAR(50) CHECK (status IN ('Planning', 'In Progress', 'Completed', 'On Hold')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
    invoices: `CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY, 
        client_id INT REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
        project_id INT REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
        amount NUMERIC(10,2) NOT NULL,
        status VARCHAR(50) CHECK (status IN ('Pending', 'Paid', 'Overdue')),
        due_date DATE, 
        issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
    campaigns: `CREATE TABLE IF NOT EXISTS campaigns (
        id SERIAL PRIMARY KEY, 
        client_id INT REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
        name VARCHAR(255) NOT NULL, 
        type VARCHAR(50) CHECK (type IN ('SEO', 'Google Ads', 'Social Media', 'Email Marketing')),
        budget NUMERIC(10,2), 
        start_date DATE, 
        end_date DATE,
        status VARCHAR(50) CHECK (status IN ('Active', 'Completed', 'Paused')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
    leads: `CREATE TABLE IF NOT EXISTS leads (
        id SERIAL PRIMARY KEY, 
        name VARCHAR(255) NOT NULL, 
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20), 
        source VARCHAR(255) CHECK (source IN ('Referral', 'Facebook', 'Nextdoor', 'Cold Call')),
        status VARCHAR(50) CHECK (status IN ('New', 'Contacted', 'Converted', 'Lost')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`,
    team: `CREATE TABLE IF NOT EXISTS team_members (
        id SERIAL PRIMARY KEY, 
        name VARCHAR(255) NOT NULL, 
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(20), 
        role VARCHAR(100), 
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`, 
    tasks: `CREATE TABLE IF NOT EXISTS tasks (
        id SERIAL PRIMARY KEY, 
        project_id INT REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
        assigned_to INT REFERENCES team_members(id) ON DELETE CASCADE NOT NULL, 
        description TEXT NOT NULL, 
        due_date DATE,
        status VARCHAR(50) CHECK (status IN ('Pending', 'In Progress', 'Completed')),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );`
};

const dataToSeed = {
    users: `
      INSERT INTO users (username, email, password)
      VALUES 
      ('Test', 'test@gmail.com', $1),
      ($2, $3, $4);
    `,
    contact_requests: `
      INSERT INTO contact_requests (name, email, message)
      VALUES 
      ('Test', 'test@gmail.com', 'Testing Messages');
    `,
    clients: `
      INSERT INTO clients (name, email, phone, company_name, website_url, status)
      VALUES 
      ('John Doe', 'john@example.com', '123-456-7890', 'Doe Marketing', 'https://doemarketing.com', 'Active'),
      ('Jane Smith', 'jane@example.com', '987-654-3210', 'Smith Designs', 'https://smithdesigns.com', 'Lead');
    `,
    projects: `
      INSERT INTO projects (client_id, name, description, start_date, deadline, status)
      VALUES 
      (1, 'Website Redesign', 'Revamp client homepage for better UX', '2025-06-01', '2025-07-15', 'Planning'),
      (2, 'SEO Optimization', 'Improve search rankings for a client', '2025-06-10', '2025-07-30', 'In Progress');
    `,
    invoices: `
      INSERT INTO invoices (client_id, project_id, amount, status, due_date)
      VALUES 
      (1, 1, 1500.00, 'Pending', '2025-07-20'),
      (2, 2, 800.00, 'Paid', '2025-06-25');
    `,
    campaigns: `
      INSERT INTO campaigns (client_id, name, type, budget, start_date, end_date, status)
      VALUES 
      (1, 'Google Ads Campaign', 'Google Ads', 500.00, '2025-06-01', '2025-07-01', 'Active'),
      (2, 'Social Media Ads', 'Social Media', 300.00, '2025-06-15', '2025-07-15', 'Paused');
    `,
    leads: `
      INSERT INTO leads (name, email, phone, source, status)
      VALUES 
      ('Mark Johnson', 'mark@example.com', '555-1234', 'Facebook', 'Contacted'),
      ('Emily Davis', 'emily@example.com', '555-5678', 'Referral', 'New');
    `,
    team_members: `
      INSERT INTO team_members (name, email, phone, role)
      VALUES 
      ('Alice Johnson', 'alice@example.com', '218-345-9494', 'Project Manager'),
      ('Bob White', 'bob@example.com', '218-345-9595', 'Frontend Developer');
    `,
    tasks: `
      INSERT INTO tasks (project_id, assigned_to, description, due_date, status)
      VALUES 
      (1, 2, 'Create homepage wireframes', '2025-06-10', 'Pending'),
      (2, 1, 'Keyword research', '2025-06-12', 'In Progress');
    `
};

module.exports = {checkQuery, tableDefinitions, dataToSeed}