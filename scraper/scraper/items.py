# Define here the models for your scraped items
import scrapy


class MedicalSchoolItem(scrapy.Item):
    name = scrapy.Field()
    type = scrapy.Field()  # MD or DO
    location = scrapy.Field()
    city = scrapy.Field()
    state = scrapy.Field()
    tuition = scrapy.Field()
    avg_gpa = scrapy.Field()
    avg_mcat = scrapy.Field()
    required_courses = scrapy.Field()  # Will be a list
    mission = scrapy.Field()
    deadlines = scrapy.Field()  # Will be a dict/JSON
    link = scrapy.Field()
    website = scrapy.Field()
    accreditation = scrapy.Field()
    class_size = scrapy.Field()
    acceptance_rate = scrapy.Field()

