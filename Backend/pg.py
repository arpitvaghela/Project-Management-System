from collections import namedtuple

import psycopg2 as db

# "dbname='pms' user='arpit' host='localhost' password='1let2me3in'"
# "dbname='pms' user='dhruvil' password='ab::12097Ef'"


def executequery(sql, data):
    '''Establish connection'''

    DSN = "dbname='pms' user='arpit' host='localhost' password='1let2me3in'"
    try:
        with db.connect(DSN) as conn:

            try:
                with conn.cursor() as cur:
                    cur.execute(sql, data)
                    print(cur.query)
            except db.IntegrityError as e:
                return False, e.pgerror
            else:
                return True, "Query Executed Succesfully"
    except db.DatabaseError as e:
        return False, e.pgerror


def executequery2(sql, data):
    DSN = "dbname='pms' user='arpit' host='localhost' password='1let2me3in'"
    with db.connect(DSN) as conn:
        with conn.cursor() as cur:
            cur.execute(sql, data)
            return cur.fetchall()
            print(cur.query)


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
    print(executequery2("select * from getproject(%s,%s)", ['dhruvil91', 1]))
