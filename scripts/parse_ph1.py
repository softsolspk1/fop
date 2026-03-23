import json
import re

def parse_data():
    with open('ph1_extracted.txt', 'r', encoding='utf-8') as f:
        lines = [line.strip() for line in f.readlines()]

    faculty_list = []
    courses_list = []

    # Simple heuristic to extract faculty
    i = 0
    while i < len(lines):
        line = lines[i]
        
        # Faculty extraction
        if line == "Email" and i + 1 < len(lines):
            email = lines[i+1]
            if "@uok.edu.pk" in email or "@" in email:
                # Trace back to find name, designation, qualification
                year_assoc = ""
                qualification = ""
                designation = ""
                phone = ""
                
                if i - 2 >= 0 and lines[i-2] == "Year of Association":
                    year_assoc = lines[i-1]
                
                # Try to find phone
                if i + 2 < len(lines) and "Phone:" in lines[i+2]:
                    phone = lines[i+3]
                    
                # Search up for Qualification
                for j in range(i-10, i):
                    if j >= 0 and lines[j] == "Qualification":
                        qualification = lines[j+1] + " " + lines[j+2]
                        designation = lines[j-1]
                        break
                        
                # Look for name assuming it ends right above bio or designation
                # A robust way is harder, I'll extract some text above designation
                name_parts = []
                for j in range(i-20, i-10):
                    if j >= 0 and lines[j].startswith("Dr.") or lines[j] == "Ms." or lines[j] == "Mr.":
                        name_parts.append(lines[j])
                        k = j + 1
                        while k < i and len(lines[k].split()) <= 2 and not lines[k].endswith('Professor') and not lines[k].endswith('Lecturer'):
                            if lines[k] not in ['DEPARTMENT OF PHARMACEUTICS  | FACULTY PROFILE', str(len(docs) if 'docs' in locals() else '')]:
                                name_parts.append(lines[k])
                            k += 1
                        break
                
                name = " ".join(name_parts)
                if not name and designation:
                    pass # Fallback needed
                    
                faculty_list.append({
                    "name": name.strip(),
                    "email": email.strip(),
                    "designation": designation.strip(),
                    "qualification": qualification.strip(),
                    "yearOfAssociation": year_assoc.strip(),
                    "phone": phone.strip()
                })
        
        # Course extraction: very basic
        # E.g., PHT- 301 or PHT-301
        course_match = re.search(r'^([A-Z]{3,4}-\s?\d{3})$', line)
        if course_match:
            code = course_match.group(1).replace(" ", "")
            # Course Title is usually above it
            # Category is above or below
            # Cr. Hrs. is above
            # This is tough because table format is flattened
            title = lines[i-3] if i-3 >= 0 else ""
            cr_hrs = lines[i-2] if i-2 >= 0 else ""
            category = lines[i-1] if i-1 >= 0 else ""
            
            # Additional detail extraction based on Outline section
            # Outline looks like: PHT-301 | Cr. Hrs. 3
            
            if len(code) >= 6 and title:
                courses_list.append({
                    "code": code,
                    "title": title,
                    "creditHours": cr_hrs,
                    "category": category,
                    "semester": "Unknown", # Needs context
                    "professional": "Unknown" # Needs context
                })

        i += 1
        
    # De-duplicate
    faculty_list = list({v['email']:v for v in faculty_list}.values())
    
    unique_courses = {}
    for c in courses_list:
        if c['code'] not in unique_courses:
            unique_courses[c['code']] = c
            
    with open('extracted_faculty.json', 'w', encoding='utf-8') as f:
        json.dump(faculty_list, f, indent=4)
        
    with open('extracted_courses.json', 'w', encoding='utf-8') as f:
        json.dump(list(unique_courses.values()), f, indent=4)
        
    print(f"Extracted {len(faculty_list)} faculty members.")
    print(f"Extracted {len(unique_courses)} courses.")

if __name__ == '__main__':
    parse_data()
