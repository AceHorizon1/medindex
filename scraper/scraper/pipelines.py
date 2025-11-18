# Define your item pipelines here
import json
import csv
from itemadapter import ItemAdapter


class CsvExportPipeline:
    def __init__(self):
        self.file = None
        self.writer = None

    def open_spider(self, spider):
        self.file = open('medical_schools.csv', 'w', newline='', encoding='utf-8')
        fieldnames = [
            'name', 'type', 'location', 'city', 'state', 'tuition', 'avg_gpa',
            'avg_mcat', 'required_courses', 'mission', 'deadlines', 'link',
            'website', 'accreditation', 'class_size', 'acceptance_rate'
        ]
        self.writer = csv.DictWriter(self.file, fieldnames=fieldnames)
        self.writer.writeheader()

    def close_spider(self, spider):
        if self.file:
            self.file.close()

    def process_item(self, item, spider):
        adapter = ItemAdapter(item)
        row = {}
        for field in adapter.field_names():
            value = adapter.get(field)
            # Convert lists and dicts to JSON strings for CSV
            if isinstance(value, (list, dict)):
                row[field] = json.dumps(value) if value else ''
            else:
                row[field] = value if value else ''
        self.writer.writerow(row)
        return item


class JsonExportPipeline:
    def __init__(self):
        self.file = None
        self.items = []

    def open_spider(self, spider):
        self.file = open('medical_schools.json', 'w', encoding='utf-8')

    def close_spider(self, spider):
        if self.file:
            json.dump(self.items, self.file, indent=2, ensure_ascii=False)
            self.file.close()

    def process_item(self, item, spider):
        self.items.append(dict(item))
        return item

