from flask import Flask, jsonify
import mysql.connector
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for cross-origin requests

# MySQL connection details
db_user = "root"
db_password = "Vijay#21"
db_host = "localhost"
db_name = "cartesian"

def get_order_status_data():
    connection = mysql.connector.connect(
        user=db_user,
        password=db_password,
        host=db_host,
        database=db_name
    )
    cursor = connection.cursor()
    cursor.execute("SELECT seller_id, COUNT(*) AS seller_count FROM cartesian_catalog_data_flat GROUP BY seller_id;")
    data = cursor.fetchall()
    cursor.close()
    connection.close()
    return data

def get_refund_status_data():
    connection = mysql.connector.connect(
        user=db_user,
        password=db_password,
        host=db_host,
        database=db_name
    )
    cursor = connection.cursor()
    cursor.execute("SELECT category_name, COUNT(*) AS category_count FROM cartesian_catalog_data_flat GROUP BY category_name;")
    data = cursor.fetchall()
    cursor.close()
    connection.close()
    return data

@app.route('/graph', methods=['GET'])
def graph_data():
    order_status_data = get_order_status_data()
    refund_status_data = get_refund_status_data()
    
    response = {
        'order_status': order_status_data,
        'refund_status': refund_status_data
    }
    
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True, port=5001)
