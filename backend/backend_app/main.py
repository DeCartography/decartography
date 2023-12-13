from flask import Flask, request, jsonify
from flask_cors import CORS
import sqlite3
# from middleware import rate_limiter
from middlewares import rate_limiter

app = Flask(__name__)
# CORS(app)
CORS(app, resources={r"/api/*": {"origins": "*"}})

@app.route('/ping', methods=['GET'])
def ping_handler():
    return jsonify({"message": "Pong"})

@app.route('/signing-message', methods=['GET'])
def signing_message_handler():
    # Implement the logic for the signing message handler here
    pass

@app.route('/submit-passport', methods=['POST'])
def submit_handler():
    # Implement the logic for the submit passport handler here
    pass


@app.route('/set-auth-cookie', methods=['POST'])
def set_auth_cookie():
    pass

@app.route('/get-txs', methods=['GET'])
def ethereum_transactions_handler():
    # Implement the logic for the Ethereum transactions handler here
    pass

@app.route('/get-eth', methods=['GET'])
def ether_balance_handler():
    # Implement the logic for the Ether balance handler here
    pass

@app.route('/get-passport-score', methods=['GET'])
def get_passport_score_handler():
    # Implement the logic for the get passport score handler here
    pass

@app.route('/get-addresses', methods=['GET'])
@rate_limiter(rate_limit=5, burst_limit=1)  # 1秒あたり最大5回、バーストは1秒に1回
def get_addresses_and_nfts_handler():
    # Implement the logic for the get addresses and NFTs handler here
    pass

@app.route('/insert-data', methods=['POST'])
def insert_data_handler():
    # Implement the logic for the insert data handler here
    pass

@app.route('/dashboard', methods=['GET'])
def dashboard_handler():
    # Implement the logic for the dashboard handler here
    pass

if __name__ == '__main__':
    app.run(debug=True, port=1337)  # You can specify the port you want to use
