import scrapy
import re
from scraper.items import MedicalSchoolItem


class MedSchoolsSpider(scrapy.Spider):
    name = 'med_schools'
    allowed_domains = ['aamc.org', 'aacom.org']
    
    # Start URLs - AAMC MSAR and AACOM websites
    start_urls = [
        'https://students-residents.aamc.org/choosing-medical-school/medical-schools',
        'https://www.aacom.org/become-a-doctor/about-osteopathic-medicine/colleges-of-osteopathic-medicine',
    ]

    def parse(self, response):
        """
        Parse the main listing pages and extract school links
        This is a template - you'll need to adjust selectors based on actual page structure
        """
        # Extract school links (adjust selectors based on actual HTML)
        school_links = response.css('a[href*="school"]::attr(href)').getall()
        
        for link in school_links:
            if link:
                full_url = response.urljoin(link)
                yield scrapy.Request(
                    url=full_url,
                    callback=self.parse_school,
                    meta={'school_type': self._determine_type(response.url)}
                )
        
        # Follow pagination if exists
        next_page = response.css('a.next::attr(href)').get()
        if next_page:
            yield response.follow(next_page, self.parse)

    def parse_school(self, response):
        """
        Parse individual school pages
        Adjust selectors based on actual page structure
        """
        item = MedicalSchoolItem()
        
        # Extract school name
        item['name'] = response.css('h1::text').get() or response.css('title::text').get()
        if item['name']:
            item['name'] = item['name'].strip()
        
        # School type (MD or DO)
        item['type'] = response.meta.get('school_type', 'MD')
        
        # Location (adjust selectors)
        location_text = response.css('.location::text').get() or response.css('[class*="location"]::text').get()
        if location_text:
            location_parts = location_text.split(',')
            item['city'] = location_parts[0].strip() if len(location_parts) > 0 else ''
            item['state'] = location_parts[1].strip() if len(location_parts) > 1 else ''
            item['location'] = location_text.strip()
        
        # Tuition (extract numbers)
        tuition_text = response.css('[class*="tuition"]::text').get() or ''
        tuition_match = re.search(r'\$?([\d,]+)', tuition_text)
        if tuition_match:
            item['tuition'] = int(tuition_match.group(1).replace(',', ''))
        
        # Average GPA
        gpa_text = response.css('[class*="gpa"]::text').get() or ''
        gpa_match = re.search(r'(\d+\.\d+)', gpa_text)
        if gpa_match:
            item['avg_gpa'] = float(gpa_match.group(1))
        
        # Average MCAT
        mcat_text = response.css('[class*="mcat"]::text').get() or ''
        mcat_match = re.search(r'(\d{3})', mcat_text)
        if mcat_match:
            item['avg_mcat'] = int(mcat_match.group(1))
        
        # Required courses (adjust based on page structure)
        courses = response.css('[class*="course"]::text').getall()
        item['required_courses'] = [c.strip() for c in courses if c.strip()]
        
        # Mission statement
        item['mission'] = response.css('[class*="mission"]::text').get() or ''
        
        # Deadlines (extract as dict)
        deadlines = {}
        primary_deadline = response.css('[class*="primary"]::text').get()
        if primary_deadline:
            deadlines['primary'] = primary_deadline.strip()
        item['deadlines'] = deadlines if deadlines else None
        
        # Website link
        item['link'] = response.css('a[href*="http"]::attr(href)').get()
        item['website'] = item['link']
        
        # Class size
        class_size_text = response.css('[class*="class"]::text').get() or ''
        class_size_match = re.search(r'(\d+)', class_size_text)
        if class_size_match:
            item['class_size'] = int(class_size_match.group(1))
        
        # Acceptance rate
        acceptance_text = response.css('[class*="acceptance"]::text').get() or ''
        acceptance_match = re.search(r'(\d+\.?\d*)%', acceptance_text)
        if acceptance_match:
            item['acceptance_rate'] = float(acceptance_match.group(1)) / 100
        
        yield item

    def _determine_type(self, url):
        """Determine if school is MD or DO based on URL"""
        if 'aacom' in url.lower() or 'osteopathic' in url.lower():
            return 'DO'
        return 'MD'


class AAMCSpider(scrapy.Spider):
    """
    Alternative spider for AAMC MSAR data
    Note: AAMC may require authentication or have restrictions
    """
    name = 'aamc_msar'
    allowed_domains = ['aamc.org']
    
    start_urls = [
        'https://students-residents.aamc.org/choosing-medical-school/medical-schools',
    ]

    def parse(self, response):
        # This would need to be customized based on AAMC's actual page structure
        # AAMC data may require login or API access
        pass


class ManualDataSpider(scrapy.Spider):
    """
    Spider for manually curated data sources
    You can add specific URLs for medical school directories
    """
    name = 'manual_sources'
    allowed_domains = []
    
    # Add URLs of medical school directory pages
    start_urls = [
        # Example: 'https://www.usnews.com/best-graduate-schools/top-medical-schools',
    ]

    def parse(self, response):
        # Customize based on source website structure
        pass

