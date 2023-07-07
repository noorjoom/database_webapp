from flask import Flask,render_template, request, jsonify
import psycopg2
from config import config
  
app = Flask(__name__,template_folder="templates")
  
@app.route("/")
def hello():
    return render_template('index.html')
  
@app.route('/get-client-data', methods=['POST'])
def handle_client_data():
    data = request.get_json()
    result = get_query(data)
    return jsonify(result)

def get_query(data):
    #return both data and count
    ret_json = {}
    query_data_head = "SELECT {} from ".format(data["column"])
    query_count_head = "SELECT COUNT(plr.plr_id), plr.plr_id from "
    query_string = ""
    query_count_tail = " GROUP BY plr.plr_id"
    #JOIN TABLES IF NECESSARY
    if len(data["table"]) == 1:
        query_string += str(data["table"][0]) + " WHERE 1=1"
    elif len(data["table"]) == 2:
        if data["table"][0] == "districts" or  data["table"][1] == "districts":
            query_string += " districts JOIN plr ON districts.district_id = plr.district_id WHERE 1=1"
        elif data["table"][0] == "fahrrad_diebstahl" or data["table"][0] == "fahrrad_diebstahl":
            query_string += " plr JOIN fahrrad_diebstahl ON plr.plr_id = fahrrad_diebstahl.plr_id WHERE 1=1"
        else:
            raise Exception("Invalid Input from Client!")
    elif len(data["table"]) == 3:
        query_string += "districts JOIN plr ON districts.district_id = plr.district_id JOIN fahrrad_diebstahl ON plr.plr_id = fahrrad_diebstahl.plr_id WHERE 1=1"
    else:
        raise Exception("Invalid Input from Client!")

    #Add Where Clauses
    if data["district_id"] != 0:
        if len(data["table"]) == 1:
            query_string += " AND district_id = " + str(data["district_id"])
        else:
            query_string += " AND plr.district_id = " + str(data["district_id"])
    if data["district_name"] != "":
        query_string += " AND district_name = \'{}\'".format(data["district_name"])
    if data["plr_id"] != "":
        query_string += " AND plr_id = \'{}\'".format(data["plr_id"])
    if data["plr_name"] != "":
        query_string += " AND plr_name = \'{}\'".format(data["plr_name"])
        """ A LOT OF BULLSHIT
    if len(data["table"]) == 3:
        if data["start_time"] != "" and data["end_time"] != "":
            if data["start_time"] > data["end_time"]:
                data["end_time"] += 24
            query_string += " AND (((tatzeit_anfang_stunde <= {0} OR tatzeit_anfang_stunde <= {1}) AND (tatzeit_ende_stunde >= {0} OR tatzeit_ende_stunde >= {1})) ".format(data["start_time", "end_time"])
            query_string += " OR ((tatzeit_anfang_stunde >= {0} AND tatzeit_ende_stunde <= {1})))".format(data["start_time"], data["end_time"])
#todo: all other filter options...
"""
    #print(query_string)

    ret_json["data"] = get_data_from_db(query_data_head + query_string)
    if data["print"]:
        ret_json["count"] = get_data_from_db(query_count_head + query_string + query_count_tail)
    else:
        ret_json["count"] = 0

    return ret_json

def get_data_from_db(query):
    conn = None
    try:
        params = config()
        conn = psycopg2.connect(**params)
        cur = conn.cursor()
        cur.execute(query)

        ret_data = cur.fetchall()

        cur.close()
    except (Exception, psycopg2.DatabaseError) as error:
        print(error)
    finally:
        if conn is not None:
            conn.close()
    return ret_data

if __name__ == '__main__':
    app.run(debug=True)