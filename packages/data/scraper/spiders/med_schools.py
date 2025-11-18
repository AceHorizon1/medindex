import scrapy

class MedSchoolsSpider(scrapy.Spider):
    name = "med_schools"
    start_urls = [
        "https://services.aamc.org/tsfreports/report.cfm?select_criteria=MSAR"
    ]

    custom_settings = {"DOWNLOAD_DELAY": 0.5}

    def parse(self, response):
        for row in response.css("table tr"):
            cells = row.css("td::text").getall()
            if len(cells) < 4:
                continue
            yield {
                "name": cells[0].strip(),
                "city": cells[1].strip(),
                "state": cells[2].strip(),
                "designation": 'MD' if 'Medicine' in cells[0] else 'DO',
                "mission": row.css("td:nth-child(4)::text").get(default='').strip()
            }
