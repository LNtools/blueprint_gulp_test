#!/usr/bin/python
# -*- coding: utf-8 -*-
import os
import csv
import json
BASE = os.path.dirname(os.path.abspath(__file__))


class ParserData(object):
    """Parseo de datos para watson IBM"""
    def __init__(self):        
        super(ParserData, self).__init__()
        self.file  = os.path.join(BASE, "../data/femicidios_tabla_Datos_Refinados_al_25_de_mayo.csv")
        self.output  = os.path.join(BASE, "../data/output.csv")
        self.data = self.get_data()
        

        with self.data as csvfile:
            reader = csv.DictReader(csvfile)
            csv_file = csv.writer(open(self.output, "wb"))
            reader = list(reader);
            headers = reader[0].keys() 
            csv_file.writerow(headers)
            for row in reader:
                r = []
                # nombre = ""
                for n in row:
                    row[n] = row[n].lower()
                    if n == "nom_app":
                        nombre = row[n].split(" ")
                        row["nombre"] = " ".join(row[n].split(" ")[0:-1])
                        row["appellido"] = row[n].split(" ")[-1]

                    r.append(row[n])
                csv_file.writerow(r)

                
    def get_data(self):
        file = open(self.file, "rb")
        return file


if __name__ == "__main__":
    ParserData()

