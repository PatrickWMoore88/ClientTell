# **ClientTell CRM**  
A full-featured CRM web application built with Express.js, PostgreSQL, and Pug. Designed for managing clients, campaigns, projects, team members, tasks, inovices, and users — with a responsive, polished UI and dynamic filtering.

## **📦 Features:**
- 🔐 User authentication with admin access control  
- 📁 Create, Read, Update, Delete (CRUD) operations for:  
    - Clients  
    - Campaigns  
    - Projects  
    - Team Members  
    - Tasks  
    - Invoices  
    - Users  
- 📊 Responsive dashboard with dynamic charts  
- 📱 Mobile-friendly navigation with collapsible sidebar + hamburger menu  
- 🔎 Facet-style filtering and inline data views  
- ✨ Smooth transitions and stylish design with custom CSS  

## **🚀 Getting Started:**  
This project is hosted on Railway, so no local installation is necessary.

## **🔗 Live App**  
You can access the app directly at: https://clienttell-production.up.railway.app/

To Login to Dashboard Use the Following Creds:  
```
Username - Test
Password - Test
```



## **⚙️ Development (Optional for Maintainers)**  
If you'd like to run the project locally for development:

**Prerequisites:**  
- Node.js (v18 or newer)
- PostgreSQL
- A local .env file with DB credentials


**Installation:**  
```
git clone https://github.com/PatrickWMoore88/ClientTell
cd clienttell-crm
npm install
```

**Database Setup:**  
No manual setup required — the database is seeded automatically with required tables and sample data when the app boots.

**Update your .env file:**  
```
DB_USER=your_user
DB_PASSWORD=your_password
DB_HOST=localhost
DB_NAME=your_db
DB_PORT=5432
```

**Run the App**  
```
npm start
```

Visit http://localhost:3000

## **🛠 File Structure:**
```
├── app/    
|    ├── config/             # DB Configuration & Schema 
|    ├── middleware/         # Auth & Session Control
|    ├── routes/             # Express Route Handlers (campaigns, clients, etc.)
|    ├── views/              # Pug Templates
├── public/                  # Static Assets (CSS, Images)
|    ├── images/              
|    ├── styles.css              
└── clientTell.js            # Main Express app
└── server.js                # Build Server
```

## **🤝 Contributing:**  
Pull requests and feedback are welcome! If you spot an issue or have ideas for improvement, open a GitHub issue or fork the repo.
