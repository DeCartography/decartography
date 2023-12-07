
import sqlite3

conn = sqlite3.connect('dc.db')
cursor = conn.cursor()

# Answers Table
cursor.execute('''
    CREATE TABLE IF NOT EXISTS answers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_address TEXT NOT NULL,
        selected_wallets TEXT NOT NULL,
        is_initial_task BOOLEAN,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP -- UTC のタイムスタンプ
    );
''')

# TaskState Table
cursor.execute("""
CREATE TABLE IF NOT EXISTS TaskState (
    is_initial_task BOOLEAN,
    initial_task_index INTEGER,
    subsequent_task_index INTEGER,
    additional_task_index INTEGER
);
""")

conn.commit()
conn.close()

print("Database 'dc.db' created successfully.")
