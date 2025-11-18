import scrapy
import csv
import re
from urllib.parse import urljoin, urlparse
from scraper.items import MedicalSchoolItem


class SchoolWebsitesSpider(scrapy.Spider):
    name = 'school_websites'
    
    # This will be set from the CSV file
    custom_settings = {
        'DOWNLOAD_DELAY': 2,  # Be respectful - 2 second delay between requests
        'RANDOMIZE_DOWNLOAD_DELAY': 0.5,
        'CONCURRENT_REQUESTS': 1,  # One at a time to be respectful
    }

    def __init__(self, csv_file='school_urls.csv', *args, **kwargs):
        super(SchoolWebsitesSpider, self).__init__(*args, **kwargs)
        self.csv_file = csv_file
        self.start_urls = []
        self.school_data = {}  # Store name/type from CSV
        
        # Read URLs from CSV
        self._load_urls_from_csv()

    def _load_urls_from_csv(self):
        """Load school URLs and metadata from CSV file"""
        try:
            with open(self.csv_file, 'r', encoding='utf-8') as f:
                reader = csv.DictReader(f)
                for row in reader:
                    # Expect CSV with columns: name, website/url, type (optional), location (optional)
                    url = row.get('website') or row.get('url') or row.get('link')
                    if url:
                        # Clean URL
                        url = url.strip()
                        if not url.startswith('http'):
                            url = 'https://' + url
                        
                        self.start_urls.append(url)
                        
                        # Store metadata
                        self.school_data[url] = {
                            'name': row.get('name', '').strip(),
                            'type': row.get('type', '').strip() or 'MD',  # Default to MD
                            'location': row.get('location', '').strip(),
                            'city': row.get('city', '').strip(),
                            'state': row.get('state', '').strip(),
                        }
            
            self.logger.info(f'Loaded {len(self.start_urls)} school URLs from {self.csv_file}')
        except FileNotFoundError:
            self.logger.error(f'CSV file {self.csv_file} not found!')
            self.logger.info('Expected CSV format: name,website,type,location (or url/link instead of website)')
        except Exception as e:
            self.logger.error(f'Error loading CSV: {e}')

    def parse(self, response):
        """Parse each school's website"""
        url = response.url
        metadata = self.school_data.get(url, {})
        
        item = MedicalSchoolItem()
        
        # Use metadata from CSV if available
        item['name'] = metadata.get('name') or self._extract_name(response)
        item['type'] = metadata.get('type') or self._extract_type(response)
        item['location'] = metadata.get('location') or self._extract_location(response)
        item['city'] = metadata.get('city') or self._extract_city(response)
        item['state'] = metadata.get('state') or self._extract_state(response)
        item['link'] = url
        item['website'] = url
        
        # Extract other fields
        item['mission'] = self._extract_mission(response)
        item['tuition'] = self._extract_tuition(response)
        item['avg_gpa'] = self._extract_gpa(response)
        item['avg_mcat'] = self._extract_mcat(response)
        item['required_courses'] = self._extract_courses(response)
        item['deadlines'] = self._extract_deadlines(response)
        item['class_size'] = self._extract_class_size(response)
        item['acceptance_rate'] = self._extract_acceptance_rate(response)
        item['accreditation'] = self._extract_accreditation(response)
        
        yield item

    def _extract_name(self, response):
        """Extract school name from various possible locations"""
        # Try multiple selectors
        selectors = [
            'h1::text',
            'title::text',
            '[class*="school-name"]::text',
            '[class*="title"]::text',
            '.school-title::text',
            'header h1::text',
        ]
        
        for selector in selectors:
            name = response.css(selector).get()
            if name:
                name = name.strip()
                # Clean up common suffixes
                name = re.sub(r'\s*-\s*.*$', '', name)  # Remove "- Home" etc
                name = re.sub(r'\s*\|\s*.*$', '', name)  # Remove "| University"
                if len(name) > 5:  # Reasonable name length
                    return name
        
        # Fallback: use domain name
        domain = urlparse(response.url).netloc
        return domain.replace('www.', '').split('.')[0].title()

    def _extract_type(self, response):
        """Determine if MD or DO school"""
        text = ' '.join(response.css('body').getall()).lower()
        
        if any(term in text for term in ['osteopathic', 'do school', 'd.o.', 'com']):
            return 'DO'
        return 'MD'

    def _extract_location(self, response):
        """Extract location"""
        # Try various location selectors
        selectors = [
            '[class*="location"]::text',
            '[class*="address"]::text',
            '[itemprop="address"]::text',
            '.address::text',
        ]
        
        for selector in selectors:
            location = response.css(selector).get()
            if location:
                return location.strip()
        
        # Try to extract from metadata
        meta_location = response.css('meta[name*="location"]::attr(content)').get()
        if meta_location:
            return meta_location
        
        return None

    def _extract_city(self, response):
        """Extract city from location"""
        location = self._extract_location(response)
        if location:
            parts = location.split(',')
            if len(parts) > 0:
                return parts[0].strip()
        return None

    def _extract_state(self, response):
        """Extract state from location"""
        location = self._extract_location(response)
        if location:
            # Look for 2-letter state code
            state_match = re.search(r',\s*([A-Z]{2})\b', location)
            if state_match:
                return state_match.group(1)
            # Look for full state name
            parts = location.split(',')
            if len(parts) > 1:
                return parts[-1].strip()
        return None

    def _extract_mission(self, response):
        """Extract mission statement"""
        selectors = [
            '[class*="mission"]::text',
            '[id*="mission"]::text',
            'section.mission p::text',
            '.about-us p::text',
        ]
        
        for selector in selectors:
            mission = ' '.join(response.css(selector).getall())
            if mission and len(mission) > 50:  # Reasonable mission length
                return mission.strip()[:1000]  # Limit length
        
        return None

    def _extract_tuition(self, response):
        """Extract tuition information"""
        text = ' '.join(response.css('body').getall())
        
        # Look for tuition patterns
        patterns = [
            r'tuition[:\s]*\$?([\d,]+)',
            r'\$([\d,]+)[\s]*tuition',
            r'tuition.*?(\$[\d,]+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    amount = match.group(1).replace(',', '').replace('$', '')
                    return int(amount)
                except:
                    pass
        
        return None

    def _extract_gpa(self, response):
        """Extract average GPA"""
        text = ' '.join(response.css('body').getall())
        
        patterns = [
            r'gpa[:\s]*(\d+\.\d+)',
            r'average.*?gpa[:\s]*(\d+\.\d+)',
            r'gpa.*?(\d+\.\d+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    return float(match.group(1))
                except:
                    pass
        
        return None

    def _extract_mcat(self, response):
        """Extract average MCAT score"""
        text = ' '.join(response.css('body').getall())
        
        patterns = [
            r'mcat[:\s]*(\d{3})',
            r'average.*?mcat[:\s]*(\d{3})',
            r'mcat.*?score[:\s]*(\d{3})',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    score = int(match.group(1))
                    if 472 <= score <= 528:  # Valid MCAT range
                        return score
                except:
                    pass
        
        return None

    def _extract_courses(self, response):
        """Extract required courses"""
        text = ' '.join(response.css('body').getall())
        
        # Common required courses
        common_courses = [
            'Biology', 'Chemistry', 'Organic Chemistry', 'Physics',
            'Mathematics', 'English', 'Biochemistry', 'Psychology',
            'Sociology', 'Calculus', 'Statistics'
        ]
        
        found_courses = []
        for course in common_courses:
            # Look for course name in text
            pattern = rf'\b{re.escape(course)}\b'
            if re.search(pattern, text, re.IGNORECASE):
                found_courses.append(course)
        
        return found_courses if found_courses else None

    def _extract_deadlines(self, response):
        """Extract application deadlines"""
        text = ' '.join(response.css('body').getall())
        
        deadlines = {}
        
        # Look for primary deadline
        primary_match = re.search(r'primary.*?deadline[:\s]*([A-Z][a-z]+\s+\d{1,2})', text, re.IGNORECASE)
        if primary_match:
            deadlines['primary'] = primary_match.group(1)
        
        # Look for secondary deadline
        secondary_match = re.search(r'secondary.*?deadline[:\s]*([A-Z][a-z]+\s+\d{1,2})', text, re.IGNORECASE)
        if secondary_match:
            deadlines['secondary'] = secondary_match.group(1)
        
        return deadlines if deadlines else None

    def _extract_class_size(self, response):
        """Extract class size"""
        text = ' '.join(response.css('body').getall())
        
        patterns = [
            r'class.*?size[:\s]*(\d+)',
            r'(\d+).*?students.*?class',
            r'enrollment[:\s]*(\d+)',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    size = int(match.group(1))
                    if 50 <= size <= 500:  # Reasonable class size
                        return size
                except:
                    pass
        
        return None

    def _extract_acceptance_rate(self, response):
        """Extract acceptance rate"""
        text = ' '.join(response.css('body').getall())
        
        patterns = [
            r'acceptance.*?rate[:\s]*(\d+\.?\d*)%',
            r'(\d+\.?\d*)%.*?acceptance',
        ]
        
        for pattern in patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                try:
                    rate = float(match.group(1)) / 100
                    if 0 < rate <= 1:  # Valid percentage
                        return rate
                except:
                    pass
        
        return None

    def _extract_accreditation(self, response):
        """Extract accreditation info"""
        text = ' '.join(response.css('body').getall())
        
        if re.search(r'lcm[ea]', text, re.IGNORECASE):
            return 'LCME'
        elif re.search(r'aacom', text, re.IGNORECASE):
            return 'AACOM'
        
        return None

