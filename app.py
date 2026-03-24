from flask import Flask, render_template, request, redirect, url_for, session, flash, jsonify
from jinja2 import TemplateNotFound
from werkzeug.security import generate_password_hash, check_password_hash
import sqlite3
import json
from datetime import datetime
import os

app = Flask(__name__)
app.secret_key = os.environ.get('SECRET_KEY', 'dev-secret-key-change-in-production')

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
    
    conn.commit()
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
            execute_query('INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
                         (username, email, hashed_password))
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
    data = request.get_json()
    asset_id = data.get('asset_id')
    quantity = float(data.get('quantity'))
    
    assets = execute_query('SELECT * FROM assets WHERE id = ?', (asset_id,))
    if not assets:
        return jsonify({'success': False, 'message': 'Asset not found'})
    
    asset = assets[0]
    total_cost = asset[3] * quantity  # price at index 3
    
    # Check if user already has this asset
    user_assets = execute_query('SELECT * FROM user_assets WHERE user_id = ? AND asset_id = ?', 
                               (session['user_id'], asset_id))
    user_asset = user_assets[0] if user_assets else None
    
    if user_asset:
        # Update existing asset
        execute_query('UPDATE user_assets SET quantity = quantity + ? WHERE user_id = ? AND asset_id = ?',
                     (quantity, session['user_id'], asset_id))
    else:
        # Create new user asset
        execute_query('INSERT INTO user_assets (user_id, asset_id, quantity) VALUES (?, ?, ?)',
                     (session['user_id'], asset_id, quantity))
    
    # Record transaction
    execute_query('''INSERT INTO transactions (user_id, asset_id, type, quantity, price, total) 
                    VALUES (?, ?, ?, ?, ?, ?)''',
                 (session['user_id'], asset_id, 'buy', quantity, asset[3], total_cost))
    
    return jsonify({
        'success': True, 
        'message': f'Successfully purchased {quantity} {asset[2]} for ${total_cost:.2f}'  # symbol at index 2
    })

@app.route('/api/sell-asset', methods=['POST'])
@login_required
def sell_asset():
    data = request.get_json()
    asset_id = data.get('asset_id')
    quantity = float(data.get('quantity'))
    
    # Check if user has enough of this asset
    user_assets = execute_query('SELECT * FROM user_assets WHERE user_id = ? AND asset_id = ?', 
                               (session['user_id'], asset_id))
    user_asset = user_assets[0] if user_assets else None
    
    if not user_asset or user_asset[3] < quantity:  # quantity at index 3
        return jsonify({'success': False, 'message': 'Insufficient balance'})
    
    assets = execute_query('SELECT * FROM assets WHERE id = ?', (asset_id,))
    asset = assets[0]
    total_value = asset[3] * quantity  # price at index 3
    
    # Update user asset
    if user_asset[3] == quantity:  # quantity at index 3
        # Remove asset if selling all
        execute_query('DELETE FROM user_assets WHERE user_id = ? AND asset_id = ?', 
                     (session['user_id'], asset_id))
    else:
        # Update quantity
        execute_query('UPDATE user_assets SET quantity = quantity - ? WHERE user_id = ? AND asset_id = ?',
                     (quantity, session['user_id'], asset_id))
    
    # Record transaction
    execute_query('''INSERT INTO transactions (user_id, asset_id, type, quantity, price, total) 
                    VALUES (?, ?, ?, ?, ?, ?)''',
                 (session['user_id'], asset_id, 'sell', quantity, asset[3], total_value))
    
    return jsonify({
        'success': True, 
        'message': f'Successfully sold {quantity} {asset[2]} for ${total_value:.2f}'  # symbol at index 2
    })

@app.route('/api/user-assets')
@login_required
def get_user_assets():
    assets = execute_query('''
        SELECT a.name, a.symbol, a.price, ua.quantity, (a.price * ua.quantity) as total_value
        FROM user_assets ua 
        JOIN assets a ON ua.asset_id = a.id 
        WHERE ua.user_id = ?
    ''', (session['user_id'],))
    
    assets_list = []
    for asset in assets:
        assets_list.append({
            'name': asset[0],  # name
            'symbol': asset[1],  # symbol
            'price': asset[2],  # price
            'quantity': asset[3],  # quantity
            'total_value': asset[4]  # total_value
        })
    
    return jsonify(assets_list)

if __name__ == '__main__':
    init_db()  # Initialize database on startup
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)