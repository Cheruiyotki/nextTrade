from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from jinja2 import TemplateNotFound
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.exceptions import BadRequest
import sqlite3
import os
import random

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

SELL_EPSILON = 1e-9

# Database configuration for Render
def get_database_url():
    if 'DATABASE_URL' in os.environ:
        return os.environ['DATABASE_URL']
    else:
        return 'nextrade.db'  # Local development

def is_postgres():
    db_url = get_database_url()
    return db_url.startswith('postgres')

# Database initialization
def init_db():
    db_url = get_database_url()
    
    if is_postgres():
        # PostgreSQL setup (for Render)
        import psycopg2
        conn = psycopg2.connect(db_url)
        c = conn.cursor()
    else:
        # SQLite setup (local development)
        conn = sqlite3.connect(db_url)
        c = conn.cursor()
    
    # Users table
    c.execute('''CREATE TABLE IF NOT EXISTS users
                 (id SERIAL PRIMARY KEY,
                  username TEXT UNIQUE NOT NULL,
                  email TEXT UNIQUE NOT NULL,
                  password TEXT NOT NULL,
                  balance REAL DEFAULT 10000.0,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    
    # Assets table
    c.execute('''CREATE TABLE IF NOT EXISTS assets
                 (id SERIAL PRIMARY KEY,
                  name TEXT NOT NULL,
                  symbol TEXT NOT NULL,
                  price REAL NOT NULL,
                  change_24h REAL,
                  type TEXT NOT NULL)''')
    
    # User assets table
    c.execute('''CREATE TABLE IF NOT EXISTS user_assets
                 (id SERIAL PRIMARY KEY,
                  user_id INTEGER NOT NULL,
                  asset_id INTEGER NOT NULL,
                  quantity REAL NOT NULL,
                  FOREIGN KEY (user_id) REFERENCES users (id),
                  FOREIGN KEY (asset_id) REFERENCES assets (id))''')
    
    # Transactions table
    c.execute('''CREATE TABLE IF NOT EXISTS transactions
                 (id SERIAL PRIMARY KEY,
                  user_id INTEGER NOT NULL,
                  asset_id INTEGER NOT NULL,
                  type TEXT NOT NULL,
                  quantity REAL NOT NULL,
                  price REAL NOT NULL,
                  total REAL NOT NULL,
                  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                  FOREIGN KEY (user_id) REFERENCES users (id),
                  FOREIGN KEY (asset_id) REFERENCES assets (id))''')
    
    # Insert sample data only if assets table is empty
    if is_postgres():
        c.execute('SELECT COUNT(*) FROM assets')
        count = c.fetchone()[0]
    else:
        c.execute('SELECT COUNT(*) FROM assets')
        count = c.fetchone()[0]
    
    if count == 0:
        sample_assets = [
            ('Bitcoin', 'BTC', 45000.50, 2.5, 'crypto'),
            ('Ethereum', 'ETH', 3200.75, 1.8, 'crypto'),
            ('Bonga Points', 'BONGA', 0.05, 0.0, 'points'),
            ('Digital Art #1', 'ART001', 150.00, 15.0, 'nft'),
            ('Litecoin', 'LTC', 120.25, -0.5, 'crypto'),
            ('Premium NFT', 'PNFT001', 450.00, 25.0, 'nft'),
            ('AirTime Credit', 'AIRTIME', 0.95, 0.0, 'points')
        ]
        
        if is_postgres():
            c.executemany('INSERT INTO assets (name, symbol, price, change_24h, type) VALUES (%s, %s, %s, %s, %s)', sample_assets)
        else:
            c.executemany('INSERT INTO assets (name, symbol, price, change_24h, type) VALUES (?, ?, ?, ?, ?)', sample_assets)

    ensure_user_balance_column(c)
    c.execute('UPDATE users SET balance = 10000.0 WHERE balance IS NULL')
    if not is_postgres():
        backfill_sqlite_ids(c, 'users')
        backfill_sqlite_ids(c, 'assets')
        backfill_sqlite_ids(c, 'user_assets')
        backfill_sqlite_ids(c, 'transactions')
    
    conn.commit()
    conn.close()

def ensure_user_balance_column(cursor):
    if is_postgres():
        cursor.execute("ALTER TABLE users ADD COLUMN IF NOT EXISTS balance REAL DEFAULT 10000.0")
        return

    cursor.execute("PRAGMA table_info(users)")
    columns = cursor.fetchall()
    column_names = [column[1] for column in columns]

    if 'balance' not in column_names:
        cursor.execute("ALTER TABLE users ADD COLUMN balance REAL DEFAULT 10000.0")

def backfill_sqlite_ids(cursor, table_name):
    cursor.execute(f"UPDATE {table_name} SET id = rowid WHERE id IS NULL")

def get_next_id(table_name):
    rows = execute_query(f"SELECT COALESCE(MAX(id), 0) + 1 FROM {table_name}")
    return int(rows[0][0] or 1) if rows else 1

def simulate_prices():
    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        if is_postgres():
            cursor.execute('SELECT id, price FROM assets')
            assets = cursor.fetchall()
            for asset in assets:
                asset_id, price = asset[0], float(asset[1])
                delta = random.uniform(-0.002, 0.002)
                new_price = max(0.0001, round(price * (1 + delta), 6))
                cursor.execute(
                    'UPDATE assets SET price = %s, change_24h = %s WHERE id = %s',
                    (new_price, round(delta * 100, 4), asset_id),
                )
        else:
            cursor.execute('SELECT id, price FROM assets')
            assets = cursor.fetchall()
            for asset in assets:
                asset_id, price = asset[0], float(asset[1])
                delta = random.uniform(-0.002, 0.002)
                new_price = max(0.0001, round(price * (1 + delta), 6))
                cursor.execute(
                    'UPDATE assets SET price = ?, change_24h = ? WHERE id = ?',
                    (new_price, round(delta * 100, 4), asset_id),
                )
        conn.commit()
    except Exception:
        conn.rollback()
    finally:
        cursor.close()
        conn.close()

# Database helper functions
def get_db_connection():
    db_url = get_database_url()
    if is_postgres():
        import psycopg2
        conn = psycopg2.connect(db_url)
        return conn
    else:
        conn = sqlite3.connect(db_url)
        conn.row_factory = sqlite3.Row
        return conn

def execute_query(query, params=()):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        if is_postgres():
            # Convert SQLite ? placeholders to PostgreSQL %s
            query = query.replace('?', '%s')
        cursor.execute(query, params)
        
        if query.strip().upper().startswith('SELECT'):
            result = cursor.fetchall()
        else:
            conn.commit()
            result = None
            
        return result
    except Exception as e:
        conn.rollback()
        raise e
    finally:
        cursor.close()
        conn.close()

# Authentication decorator
def login_required(f):
    from functools import wraps
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            if request.path.startswith('/api/'):
                return jsonify({'success': False, 'message': 'Authentication required'}), 401
            flash('Please log in to access this page.', 'error')
            return redirect(url_for('login'))
        return f(*args, **kwargs)
    return decorated_function

# Routes
@app.route('/')
def index():
    try:
        return render_template('index.html')
    except TemplateNotFound:
        return (
            "<h1>Index page not found</h1>"
            "<p>Please create templates/index.html under your project root.</p>"
            "<p><a href='/explore'>Explore</a></p>"
        ), 200

@app.route('/explore')
def explore():
    simulate_prices()
    assets = execute_query('SELECT * FROM assets')
    return render_template('explore.html', assets=assets)

@app.route('/how-it-works')
def how_it_works():
    return render_template('how_it_works.html')

@app.route('/portfolio')
@login_required
def portfolio():
    return render_template('portfolio.html')

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username']
        password = request.form['password']
        
        users = execute_query('SELECT * FROM users WHERE username = ?', (username,))
        user = users[0] if users else None
        
        if user and check_password_hash(user[3], password):  # password is at index 3
            session['user_id'] = user[0]  # id at index 0
            session['username'] = user[1]  # username at index 1
            flash('Login successful!', 'success')
            return redirect(url_for('index'))
        else:
            flash('Invalid username or password.', 'error')
    
    return render_template('login.html')

@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username']
        email = request.form['email']
        password = request.form['password']
        confirm_password = request.form['confirm_password']
        
        if password != confirm_password:
            flash('Passwords do not match.', 'error')
            return render_template('register.html')
        
        hashed_password = generate_password_hash(password)
        
        try:
            if is_postgres():
                execute_query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                             (username, email, hashed_password))
            else:
                execute_query('INSERT INTO users (id, username, email, password) VALUES (?, ?, ?, ?)',
                             (get_next_id('users'), username, email, hashed_password))
            flash('Registration successful! Please log in.', 'success')
            return redirect(url_for('login'))
        except Exception as e:
            flash('Username or email already exists.', 'error')
    
    return render_template('register.html')

@app.route('/logout')
def logout():
    session.clear()
    flash('You have been logged out.', 'info')
    return redirect(url_for('index'))

@app.route('/buy-crypto')
@login_required
def buy_crypto():
    crypto_assets = execute_query('SELECT * FROM assets WHERE type = ?', ('crypto',))
    user_assets = execute_query('''
        SELECT a.name, a.symbol, ua.quantity 
        FROM user_assets ua 
        JOIN assets a ON ua.asset_id = a.id 
        WHERE ua.user_id = ? AND a.type = ?
    ''', (session['user_id'], 'crypto'))
    return render_template('buy_crypto.html', assets=crypto_assets, user_assets=user_assets)

@app.route('/sell-points')
@login_required
def sell_points():
    point_assets = execute_query('SELECT * FROM assets WHERE type = ?', ('points',))
    user_points = execute_query('''
        SELECT a.name, a.symbol, ua.quantity 
        FROM user_assets ua 
        JOIN assets a ON ua.asset_id = a.id 
        WHERE ua.user_id = ? AND a.type = ?
    ''', (session['user_id'], 'points'))
    return render_template('sell_points.html', assets=point_assets, user_points=user_points)

@app.route('/nft-marketplace')
@login_required
def nft_marketplace():
    nft_assets = execute_query('SELECT * FROM assets WHERE type = ?', ('nft',))
    user_nfts = execute_query('''
        SELECT a.name, a.symbol, ua.quantity 
        FROM user_assets ua 
        JOIN assets a ON ua.asset_id = a.id 
        WHERE ua.user_id = ? AND a.type = ?
    ''', (session['user_id'], 'nft'))
    return render_template('nft_marketplace.html', assets=nft_assets, user_nfts=user_nfts)

@app.route('/api/buy-asset', methods=['POST'])
@login_required
def buy_asset():
    try:
        data = request.get_json(force=False, silent=False)
        if not isinstance(data, dict):
            raise ValueError('JSON body must be an object.')

        asset_id = int(data.get('asset_id'))
        quantity = float(data.get('quantity'))
        if quantity <= 0:
            raise ValueError('Quantity must be greater than zero.')
    except (BadRequest, TypeError, ValueError) as error:
        return jsonify({'success': False, 'message': f'Invalid request payload: {error}'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        select_asset_query = 'SELECT * FROM assets WHERE id = %s' if is_postgres() else 'SELECT * FROM assets WHERE id = ?'
        cursor.execute(select_asset_query, (asset_id,))
        asset = cursor.fetchone()

        if not asset:
            return jsonify({'success': False, 'message': 'Asset not found'}), 400

        price = float(asset[3])
        total_cost = price * quantity

        select_user_query = 'SELECT id, balance FROM users WHERE id = %s' if is_postgres() else 'SELECT id, balance FROM users WHERE id = ?'
        cursor.execute(select_user_query, (session['user_id'],))
        user = cursor.fetchone()

        if not user:
            return jsonify({'success': False, 'message': 'User account not found'}), 400

        current_balance = float(user[1] or 0.0)
        if current_balance < total_cost:
            return jsonify({'success': False, 'message': 'Insufficient wallet balance'}), 400

        select_user_asset_query = (
            'SELECT * FROM user_assets WHERE user_id = %s AND asset_id = %s'
            if is_postgres()
            else 'SELECT * FROM user_assets WHERE user_id = ? AND asset_id = ?'
        )
        cursor.execute(select_user_asset_query, (session['user_id'], asset_id))
        user_asset = cursor.fetchone()

        if user_asset:
            update_asset_query = (
                'UPDATE user_assets SET quantity = quantity + %s WHERE user_id = %s AND asset_id = %s'
                if is_postgres()
                else 'UPDATE user_assets SET quantity = quantity + ? WHERE user_id = ? AND asset_id = ?'
            )
            cursor.execute(update_asset_query, (quantity, session['user_id'], asset_id))
        else:
            if is_postgres():
                insert_asset_query = 'INSERT INTO user_assets (user_id, asset_id, quantity) VALUES (%s, %s, %s)'
                cursor.execute(insert_asset_query, (session['user_id'], asset_id, quantity))
            else:
                cursor.execute('SELECT COALESCE(MAX(id), 0) + 1 FROM user_assets')
                next_user_asset_id = int(cursor.fetchone()[0] or 1)
                insert_asset_query = 'INSERT INTO user_assets (id, user_id, asset_id, quantity) VALUES (?, ?, ?, ?)'
                cursor.execute(insert_asset_query, (next_user_asset_id, session['user_id'], asset_id, quantity))

        update_balance_query = (
            'UPDATE users SET balance = balance - %s WHERE id = %s'
            if is_postgres()
            else 'UPDATE users SET balance = balance - ? WHERE id = ?'
        )
        cursor.execute(update_balance_query, (total_cost, session['user_id']))

        if is_postgres():
            insert_tx_query = 'INSERT INTO transactions (user_id, asset_id, type, quantity, price, total) VALUES (%s, %s, %s, %s, %s, %s)'
            cursor.execute(insert_tx_query, (session['user_id'], asset_id, 'buy', quantity, price, total_cost))
        else:
            cursor.execute('SELECT COALESCE(MAX(id), 0) + 1 FROM transactions')
            next_tx_id = int(cursor.fetchone()[0] or 1)
            insert_tx_query = 'INSERT INTO transactions (id, user_id, asset_id, type, quantity, price, total) VALUES (?, ?, ?, ?, ?, ?, ?)'
            cursor.execute(insert_tx_query, (next_tx_id, session['user_id'], asset_id, 'buy', quantity, price, total_cost))

        conn.commit()
        return jsonify({
            'success': True,
            'message': f'Successfully purchased {quantity} {asset[2]} for ${total_cost:.2f}',
            'new_balance': round(current_balance - total_cost, 2),
        })
    except Exception:
        conn.rollback()
        return jsonify({'success': False, 'message': 'Failed to execute trade.'}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/sell-asset', methods=['POST'])
@login_required
def sell_asset():
    try:
        data = request.get_json(force=False, silent=False)
        if not isinstance(data, dict):
            raise ValueError('JSON body must be an object.')
        asset_id = int(data.get('asset_id'))
        quantity = float(data.get('quantity'))
        if quantity <= 0:
            raise ValueError('Quantity must be greater than zero.')
    except (BadRequest, TypeError, ValueError) as error:
        return jsonify({'success': False, 'message': f'Invalid request payload: {error}'}), 400

    conn = get_db_connection()
    cursor = conn.cursor()
    try:
        select_user_asset_query = (
            'SELECT * FROM user_assets WHERE user_id = %s AND asset_id = %s'
            if is_postgres()
            else 'SELECT * FROM user_assets WHERE user_id = ? AND asset_id = ?'
        )
        cursor.execute(select_user_asset_query, (session['user_id'], asset_id))
        user_asset = cursor.fetchone()

        if not user_asset or float(user_asset[3]) < quantity:
            return jsonify({'success': False, 'message': 'Insufficient asset quantity'}), 400

        select_asset_query = 'SELECT * FROM assets WHERE id = %s' if is_postgres() else 'SELECT * FROM assets WHERE id = ?'
        cursor.execute(select_asset_query, (asset_id,))
        asset = cursor.fetchone()

        if not asset:
            return jsonify({'success': False, 'message': 'Asset not found'}), 400

        price = float(asset[3])
        total_value = price * quantity

        owned_quantity = float(user_asset[3])

        if abs(owned_quantity - quantity) <= SELL_EPSILON:
            delete_asset_query = (
                'DELETE FROM user_assets WHERE user_id = %s AND asset_id = %s'
                if is_postgres()
                else 'DELETE FROM user_assets WHERE user_id = ? AND asset_id = ?'
            )
            cursor.execute(delete_asset_query, (session['user_id'], asset_id))
        else:
            update_asset_query = (
                'UPDATE user_assets SET quantity = quantity - %s WHERE user_id = %s AND asset_id = %s'
                if is_postgres()
                else 'UPDATE user_assets SET quantity = quantity - ? WHERE user_id = ? AND asset_id = ?'
            )
            cursor.execute(update_asset_query, (quantity, session['user_id'], asset_id))

        update_balance_query = (
            'UPDATE users SET balance = balance + %s WHERE id = %s'
            if is_postgres()
            else 'UPDATE users SET balance = balance + ? WHERE id = ?'
        )
        cursor.execute(update_balance_query, (total_value, session['user_id']))

        if is_postgres():
            insert_tx_query = 'INSERT INTO transactions (user_id, asset_id, type, quantity, price, total) VALUES (%s, %s, %s, %s, %s, %s)'
            cursor.execute(insert_tx_query, (session['user_id'], asset_id, 'sell', quantity, price, total_value))
        else:
            cursor.execute('SELECT COALESCE(MAX(id), 0) + 1 FROM transactions')
            next_tx_id = int(cursor.fetchone()[0] or 1)
            insert_tx_query = 'INSERT INTO transactions (id, user_id, asset_id, type, quantity, price, total) VALUES (?, ?, ?, ?, ?, ?, ?)'
            cursor.execute(insert_tx_query, (next_tx_id, session['user_id'], asset_id, 'sell', quantity, price, total_value))

        select_balance_query = 'SELECT balance FROM users WHERE id = %s' if is_postgres() else 'SELECT balance FROM users WHERE id = ?'
        cursor.execute(select_balance_query, (session['user_id'],))
        updated_balance_row = cursor.fetchone()
        updated_balance = float(updated_balance_row[0] or 0.0) if updated_balance_row else 0.0

        conn.commit()
        return jsonify({
            'success': True,
            'message': f'Successfully sold {quantity} {asset[2]} for ${total_value:.2f}',
            'new_balance': round(updated_balance, 2),
        })
    except Exception:
        conn.rollback()
        return jsonify({'success': False, 'message': 'Failed to execute sale.'}), 500
    finally:
        cursor.close()
        conn.close()

@app.route('/api/user-assets')
@login_required
def get_user_assets():
    assets = execute_query('''
        SELECT a.id, a.name, a.symbol, a.price, ua.quantity, (a.price * ua.quantity) as total_value
        FROM user_assets ua 
        JOIN assets a ON ua.asset_id = a.id 
        WHERE ua.user_id = ?
    ''', (session['user_id'],))
    
    assets_list = []
    for asset in assets:
        assets_list.append({
            'asset_id': asset[0],
            'name': asset[1],  # name
            'symbol': asset[2],  # symbol
            'price': asset[3],  # price
            'quantity': asset[4],  # quantity
            'total_value': asset[5]  # total_value
        })
    
    return jsonify(assets_list)

@app.route('/api/market-assets')
@login_required
def market_assets():
    assets = execute_query('SELECT id, name, symbol, price, change_24h, type FROM assets ORDER BY symbol ASC')
    payload = []
    for asset in assets:
        payload.append({
            'id': asset[0],
            'name': asset[1],
            'symbol': asset[2],
            'price': asset[3],
            'change_24h': asset[4],
            'type': asset[5],
        })
    return jsonify(payload)

@app.route('/api/dashboard-summary')
@login_required
def dashboard_summary():
    user_rows = execute_query('SELECT balance FROM users WHERE id = ?', (session['user_id'],))
    balance = float(user_rows[0][0] or 0.0) if user_rows else 0.0

    holding_rows = execute_query('''
        SELECT (a.price * ua.quantity) AS total_value, a.change_24h
        FROM user_assets ua
        JOIN assets a ON ua.asset_id = a.id
        WHERE ua.user_id = ?
    ''', (session['user_id'],))

    holdings_total = sum(float(row[0] or 0.0) for row in holding_rows)
    net_worth = balance + holdings_total

    weighted_change_value = 0.0
    for row in holding_rows:
        value = float(row[0] or 0.0)
        pct = float(row[1] or 0.0) / 100.0
        weighted_change_value += value * pct

    change_pct = (weighted_change_value / net_worth) * 100 if net_worth > 0 else 0.0

    return jsonify({
        'balance': round(balance, 2),
        'holdings_total': round(holdings_total, 2),
        'net_worth': round(net_worth, 2),
        'change_24h_pct': round(change_pct, 2),
        'live': True,
    })

# Ensure tables/migrations are applied in both local run and WSGI deployments.
init_db()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)
