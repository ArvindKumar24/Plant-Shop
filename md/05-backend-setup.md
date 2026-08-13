r# ⚙️ 05 — Backend Setup

In this step you will:
1. Configure the database connection in `backend/config.py`.
2. Create a Python virtual environment.
3. Install the required Python dependency.

---

## 🔧 1. Configure the database connection

Open the file **`backend/config.py`** in a text editor.

Find this section:

```python
# --- Database settings ---
DB_CONFIG = {
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "password",          # change to your MySQL root password
    "database": "plant_shop",
}
```

Change the `"password"` value to your **actual MySQL root password**.

### Example

If your MySQL root password is `MySecret123`, it should look like:

```python
DB_CONFIG = {
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "MySecret123",
    "database": "plant_shop",
}
```

> ⚠️ If your MySQL username is not `root`, change the `"user"` value too. Leave `host`, `port`, and `database` as they are.

---

## 🐍 2. Create a Python virtual environment

A virtual environment keeps the project's dependencies isolated. Navigate to the `backend` folder:

### Windows

```bash
cd "d:\New folder (2)\backend"
python -m venv venv
```

### macOS / Linux

```bash
cd /path/to/project/backend
python3 -m venv venv
```

This creates a `venv` folder inside `backend`.

---

## ▶️ 3. Activate the virtual environment

### Windows (Command Prompt)

```bash
venv\Scripts\activate
```

### Windows (PowerShell)

```powershell
venv\Scripts\Activate.ps1
```

### macOS / Linux

```bash
source venv/bin/activate
```

After activation, your prompt should show `(venv)` at the beginning, e.g.:

```
(venv) d:\New folder (2)\backend>
```

---

## 📦 4. Install the Python dependency

The project has only one dependency: **`mysql-connector-python`** (listed in `backend/requirements.txt`).

```bash
pip install -r requirements.txt
```

Or install it directly:

```bash
pip install mysql-connector-python
```

---

## ✅ 5. Verify the backend can connect

With the virtual environment still active, run a quick test that imports the database module:

```bash
python -c "import database; print('Database module OK')"
```

If you see `Database module OK`, the backend is correctly configured.

---

## ✅ Next Step

The backend is ready to run!

**[Next: 06 — Run the Project →](./06-run-project.md)**
