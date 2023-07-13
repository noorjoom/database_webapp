import psycopg2
from psycopg2 import sql
from config import config

# Connect to your postgres DB
conn = psycopg2.connect("dbname=db_test user=postgres password=161100")

#Connect to your postgres DB with config file (database.ini)
params = config()
conn = psycopg2.connect(**params)

# Open a cursor to perform database operations
cur = conn.cursor()

# Create table for Districts
cur.execute("""
    CREATE TABLE Districts(
        Gemeinde_schluessel INT PRIMARY KEY,
        Gemeinde_name TEXT
    );
""")

# Create table for Planning Areas
cur.execute("""
    CREATE TABLE PlanningAreas(
        PLR_ID INT PRIMARY KEY,
        PLR_NAME TEXT,
        GROESSE_M2 FLOAT,
        BEZ INT,
        FOREIGN KEY(BEZ) REFERENCES Districts(Gemeinde_schluessel),
        EMPTY TEXT
    );
""")

# Create table for Bicycle Thefts
cur.execute("""
    CREATE TABLE BicycleThefts(
        Theft_ID INT PRIMARY KEY,
        ART_DES_FAHRRADS TEXT,
        SCHADENSHOEHE FLOAT,
        TATZEIT_ANFANG_DATUM DATE,
        TATZEIT_ANFANG_STUNDE INT,
        TATZEIT_ENDE_DATUM DATE,
        TATZEIT_ENDE_STUNDE INT,
        LOR INT,
        FOREIGN KEY(LOR) REFERENCES PlanningAreas(PLR_ID)
    );
""")

# Load data from csv file
with open("database_csv/districts.csv", "r", encoding="UTF-8") as file:
    next(file) # Skip the header row.
    cur.copy_from(file, "districts", sep=',')

with open("database_csv/planningspace.csv", "r", encoding="UTF-8") as file:
    next(file) # Skip the header row.
    cur.copy_from(file, "planningareas", sep=',')

with open("database_csv/bicycletheft.csv", "r", encoding="UTF-8") as file:
    next(file) # Skip the header row.
    cur.copy_from(file, "bicyclethefts", sep=',')

# Commit changes and close the connection
conn.commit()
cur.close()
conn.close()