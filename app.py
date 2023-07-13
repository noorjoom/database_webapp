from flask import Flask,render_template, request, jsonify
import psycopg2
from config import config
import locale

locale.setlocale(locale.LC_TIME, "de_DE.UTF-8")
  
app = Flask(__name__,template_folder="templates")
  
@app.route("/")
def hello():
    return render_template('index.html')
  
@app.route('/get-client-data', methods=['POST'])
def handle_client_data():
    data = request.get_json()
    result = get_query(data)
    print(result)
    return jsonify(result)

def get_query(data):
    #return both data and count
    ret_json = {}
    query_data_head = "SELECT {} from ".format(data["column"])
    query_count_head = "SELECT COUNT(plr_id), plr_id from "
    query_string = ""
    query_count_tail = " GROUP BY plr_id"
    #JOIN TABLES IF NECESSARY
    if len(data["table"]) == 1:
        query_string += str(data["table"][0]) + " WHERE 1=1"
    elif len(data["table"]) == 2:
        if data["table"][0] == "districts" or  data["table"][1] == "districts":
            query_string += " districts JOIN planningareas ON districts.gemeinde_schluessel = planningareas.bez WHERE 1=1"
        elif data["table"][0] == "bicyclethefts" or data["table"][1] == "bicyclethefts":
            query_string += " planningareas JOIN bicyclethefts ON planningareas.plr_id = bicyclethefts.lor WHERE 1=1"
        else:
            raise Exception("Invalid Input from Client!")
    elif len(data["table"]) == 3:
        query_string += "districts JOIN planningareas ON districts.gemeinde_schluessel = planningareas.bez JOIN bicyclethefts ON planningareas.plr_id = bicyclethefts.lor WHERE 1=1"
    else:
        raise Exception("Invalid Input from Client!")

    #Add Where Clauses
    if data["district_id"] != 0:
        if data["table"] == "districts":
            query_string += " AND gemeinde_schluessel = " + str(data["district_id"])
        else:
            query_string += " AND planningareas.bez = " + str(data["district_id"])
    if data["district_name"] != "":
        query_string += " AND gemeinde_name = \'{}\'".format(data["district_name"])
    if data["plr_id"] != "":
        query_string += " AND plr_id = \'{}\'".format(data["plr_id"])
    if data["plr_name"] != "":
        query_string += " AND plr_name = \'{}\'".format(data["plr_name"])
    #complicated filters
    if len(data["table"]) == 3:
        start_d = "2022-01-01"
        end_d = "2023-06-09"
        if data["start_date"] != "" and data["end_date"] != "":
            start_d = data["start_date"]
            end_d = data["end_date"]
        elif data["start_date"] != "":
            start_d = data["start_date"]
        elif data["end_date"] != "":
            end_d = data["end_date"]
        query_string += """ AND ((tatzeit_anfang_datum >= \'{0}\' AND tatzeit_anfang_datum <= \'{1}\') 
                            OR (tatzeit_ende_datum >= \'{0}\' AND tatzeit_ende_datum <= \'{1}\') 
                            OR (tatzeit_anfang_datum <= \'{0}\' AND tatzeit_ende_datum >= \'{1}\'))""".format(start_d, end_d)       
        if data["min_dmg"] != "":
            query_string += " AND schadenshoehe >= " + str(data["min_dmg"])
        if data["max_dmg"] != "":
            query_string += " AND schadenshoehe <= " + str(data["max_dmg"])
        if data["bike_type"] != "":
            query_string += " AND art_des_fahrrads = \'{}\'".format(data["bike_type"])

    print(query_string)

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