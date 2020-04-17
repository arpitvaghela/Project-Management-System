import psycopg2 as db
from collections import namedtuple
# establish connection


def executequery(sql, data):
    DSN = "dbname='pms' user='arpit' host='localhost' password='1let2me3in'"
    try:
        with db.connect(DSN) as conn:

            try:
                with conn.cursor() as cur:
                    cur.execute(sql, data)
                    print(cur.query)

            except Exception as e:
                return False, e.pgerror
            else:
                return True, "Query Executed Succesfully"
    except db.OperationalError as e:
        return False, e.pgerror


def inputfile(path):
    try:
        with open(path, 'rb') as file:
            data = file.read()
            return data
    except Exception as e:
        print("Failed to read file")


def outputfile(blob, path):
    try:
        with open(path, 'wb') as file:
            file.write(blob)
    except Exception as e:
        print("Failed to write file")


if __name__ == "__main__":
    outputfile(inputfile('requirement.txt'),'r.txt')