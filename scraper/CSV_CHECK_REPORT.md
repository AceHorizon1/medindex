# CSV Check Report — scraped_schools_cyberscraper.csv

## Summary
- **Total rows:** 27 schools (1 header + 26 data rows)
- **Obvious fakes/hallucinations:** 6 rows to remove
- **Wrong type (should be DO):** 6 osteopathic schools marked as MD
- **Wrong links or locations:** 8 rows need correction

---

## Remove (fake or example data)
| Row | Name | Why |
|-----|------|-----|
| 3 | XYZ Academic Institute | example.edu, placeholder data |
| 9 | Hong Kong Medical University | Not a US school; URL was BU (bumc.bu.edu) – AI hallucination |
| 17 | Medical Institute | example.edu/museum |
| 18 | Example Name | example.com |
| 20 | Clinical University | example.edu/medical |
| 22 | Medical School | mdschool.edu, generic |
| 24 | Harvard Medical School | example.org (duplicate of Harvard row with wrong link) |

---

## Fix type: MD → DO (osteopathic schools)
- **Row 2** Arkansas College of Osteopathic Medicine
- **Row 4** School of Osteopathic Medicine in Arizona
- **Row 5** Alabama College of Osteopathic Medicine
- **Row 11** Burrell College of Osteopathic Medicine
- **Row 12** College of Osteopathic Medicine (CHSU)
- **Row 14** Campbell University School of Osteopathic Medicine

---

## Fix link and/or location
| Row | Name | Issue | Correct |
|-----|------|--------|---------|
| 2 | Arkansas College of Osteopathic Medicine | Wrong link | https://arcom.achehealth.edu/ |
| 8 | Baylor College of Medicine | City "Baylor, TX" | Houston, TX |
| 10 | Warren Alpert Medical School | Wrong link, city | https://medical.brown.edu/, Providence, RI |
| 11 | Burrell College | Wrong link | https://burrell.edu/ |
| 16 | Case Western Reserve University | Columbus, wrong link | Cleveland, OH; https://case.edu/medicine/ |
| 23 | Duke University School of Medicine | Philadelphia, wrong link | Durham, NC; https://medschool.duke.edu/ |
| 21 | Zucker School of Medicine | Link missing https | https://medicine.hofstra.edu/ |
| 27 | Medical College of South Carolina | Wrong name/URL/city | Medical University of South Carolina; https://www.musc.edu/; Charleston, SC |

---

## OK as-is (minor gaps)
- Albany Medical College, Midwestern, Albany, Carle Illinois, Quillen, Eastern Virginia, etc. — real schools; some missing tuition/GPA/MCAT is normal.

---

## Recommendation
1. Remove the 7 fake rows.
2. Apply the type/link/location fixes above (or use the cleaned CSV).
3. Re-import to Supabase after cleaning.
