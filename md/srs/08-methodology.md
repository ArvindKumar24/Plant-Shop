# 8. Methodology

## 8.1 Research Approach

The project adopted a **Design Science Research (DSR)** approach, which is well suited to building and evaluating an artefact (the GreenLeaf Plants system) to solve a real-world problem.

### 8.1.1 DSR Iterations Applied

1. **Problem Identification** — Established via survey (Section 2) and field visit (Section 4) that customers need an online plant store and the owner needs an admin tool.
2. **Objectives of a Solution** — Defined the objectives and scope in Section 1, and success criteria in the problem statement (Section 5).
3. **Design & Development** — Designed the architecture (Section 6) and built the working application.
4. **Demonstration** — Ran the application and demonstrated the customer and admin flows.
5. **Evaluation** — Tested features against the functional requirements (results in Section 9).
6. **Communication** — Documented the complete project in this SRS for stakeholders.

### 8.1.2 Mixed Data Collection

Both **quantitative** (structured survey, N=70) and **qualitative** (interviews and observation) methods informed the requirements, ensuring the system meets real customer and business needs.

---

## 8.2 Development Methodology

The software was developed using an **iterative, incremental** approach inspired by Agile practices. The project was broken into small, verifiable increments, each adding a distinct feature set.

| Iteration | Delivered Feature |
|-----------|-------------------|
| 1 | Database schema, seed data, and base server setup |
| 2 | Product catalogue API + listing/search/filter frontend |
| 3 | Customer registration & login (auth tokens) |
| 4 | Product detail page + cart (localStorage) |
| 5 | Checkout with Cash / UPI / Card + order placement |
| 6 | Admin dashboard: product CRUD + order management + UPI settings |
| 7 | Order tracking: admin status updates + customer My Orders page |
| 8 | Styling, responsiveness, and final testing |

Each iteration followed the cycle: **plan → implement → test → integrate → evaluate**.

---

## 8.3 Tools and Technologies Used

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Backend** | Python 3.9+ (`http.server`, `ThreadingHTTPServer`) | HTTP server, routing, REST API, static file serving |
| **Database** | MySQL 8.x | Persistent, relational storage |
| **DB Driver** | `mysql-connector-python` | MySQL connectivity + connection pooling |
| **Frontend** | HTML5, CSS3, Vanilla JavaScript | Responsive UI and client-side logic |
| **Data Format** | JSON | API request/response format |
| **Version Control** | Git (recommended) | Source code management |
| **Documentation** | Markdown (`.md`) | This SRS and guides |
| **Testing Tools** | Browser DevTools, manual test scripts | Functional verification |

### 8.3.1 Key Backend Dependencies

The only Python library required is:

```
mysql-connector-python>=8.0.0
```

as defined in `backend/requirements.txt`.

---

## 8.4 Data Collection Methods

| Method | Description | Outcome |
|--------|-------------|---------|
| **Online & Printed Questionnaire** | Structured survey distributed to 70 respondents | Quantitative requirements data (Section 2) |
| **Semi-Structured Interviews** | Interviews with a nursery owner, staff, and 9 customers on-site | Qualitative insights (Section 4) |
| **Direct Observation** | Observation of the physical store and manual processes | Process understanding & problem identification |
| **Photographic Documentation** | Photographs of the nursery, notebook inventory, and payment counter | Visual evidence for the field visit report |
| **Walkthrough Testing** | Manual test scenarios for customer and admin flows | Verification of functional requirements |

---

## 8.5 System Implementation Steps

### Step 1 — Database Setup
1. Create `database/schema.sql` defining the five tables, constraints, and 12 seed products.
2. Import using `mysql -u root -p < database/schema.sql`.

### Step 2 — Backend Configuration & Database Layer
1. Configure `backend/config.py` with the MySQL password, host, port, and admin defaults.
2. Implement `backend/database.py` with `get_pool()`, `query()`, and `execute()` for parameterized access.

### Step 3 — Server & API
1. Implement `backend/server.py` with the `PlantHandler` request handler.
2. Add routing for `do_GET`, `do_POST`, `do_PUT`, `do_DELETE`, and `do_OPTIONS`.
3. Implement public API handlers (products, auth, orders) and admin API handlers.
4. Add static file serving with path-traversal protection.

### Step 4 — Frontend Static Pages
1. Build the HTML pages: `index.html`, `products.html`, `product.html`, `cart.html`, `checkout.html`, `orders.html`, `login.html`, `register.html`, `admin.html`.
2. Create `css/styles.css` for the responsive theme.

### Step 5 — Frontend JavaScript Logic
1. `api.js` — fetch helpers for all REST endpoints.
2. `auth.js` — token/user storage, `requireAuth()`, auth nav.
3. `cart.js` — `localStorage` cart management.
4. `products.js` — listing, search, filters.
5. `checkout.js` — form, payment selection, order submission.
6. `orders.js` — My Orders rendering and progress tracker.
7. `admin.js` — login, product CRUD, order status, UPI settings.

### Step 6 — Integration & Testing
1. Run `python server.py` in the `backend` folder.
2. Test all customer and admin flows against the requirements.
3. Validate security: SQL injection attempts, unauthorized token access, path traversal.
4. Verify responsiveness on multiple screen sizes.

### Step 7 — Documentation
1. Write `README.md`, `md/SETUP-GUIDE.md`, and this SRS (`md/srs/`).

---

## 8.6 Advantage of Methodology

1. **Iterative & Incremental Development** — Delivers working software early, reduces risk, and allows requirements to be refined based on feedback.

2. **Evidence-Based Requirements** — Combining surveys, interviews, and observation ensures the system addresses real needs rather than assumptions.

3. **Design Science Framework** — Provides a rigorous, repeatable process that links problem identification to a designed artefact and its evaluation.

4. **Low-Dependency Stack** — Focusing on pure Python, MySQL, and vanilla JS keeps the toolchain simple and the system easy to build, run, and maintain.

5. **Built-In Evaluation** — Each functional requirement was verified through structured walkthrough testing, linking development directly to the SRS.

6. **Complete Documentation** — The methodology produced both the working system and comprehensive documentation, supporting learning, demonstration, and future maintenance.
