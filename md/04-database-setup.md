s# 🗃️ 04 — Database Setup

In this step you will **create the database**, **tables**, **seed data** (sample products + admin account) using the provided `database/schema.sql` file.

---

## 📁 Where the schema file lives

The schema file is located at:

```
database/schema.sql
```

It automatically:
- Creates a database named **`plant_shop`**
- Creates all tables (`users`, `products`, `orders`, `order_items`, `admin_users`)
- Inserts **12 sample plants** and the **default admin account** (`admin` / `admin123`)

---

## 🚀 Run the schema

Open a terminal / command prompt and navigate to the **project root folder** (the folder containing the `database` folder).

### Windows (Command Prompt)

```bash
cd "d:\New folder (2)"
mysql -u root -p < database\schema.sql
```

### macOS / Linux

```bash
cd /path/to/project
mysql -u root -p < database/schema.sql
```

You will be prompted for your MySQL **root password**. Enter it and press Enter.

If everything works, MySQL runs the script silently (no errors). If you see errors, see the [Troubleshooting](./08-troubleshooting.md) guide.

---

## ✅ Verify the database was created

Connect to MySQL and check:

```bash
mysql -u root -p
```

Then run:

```sql
USE plant_shop;
SHOW TABLES;
SELECT COUNT(*) FROM products;
SELECT * FROM admin_users;
```

Expected output:
- `SHOW TABLES;` lists: `admin_users`, `order_items`, `orders`, `products`, `users`
- `SELECT COUNT(*) FROM products;` returns `12`
- `admin_users` contains one row: username `admin`

Type `EXIT;` to leave the MySQL prompt.

---

## ✅ Next Step

The database is ready. Now configure and install the Python backend:

**[Next: 05 — Backend Setup →](./05-backend-setup.md)**
