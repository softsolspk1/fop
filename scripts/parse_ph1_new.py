import re
import json

def determine_professional(code):
    try:
        num = int(re.search(r'\d{3}', code).group())
        if 300 <= num < 400: return 'First'
        elif 400 <= num < 500: return 'Second'
        elif 500 <= num < 600: return 'Third'
        elif 600 <= num < 700: return 'Fourth'
        elif 700 <= num < 800: return 'Fifth'
        return 'Unknown'
    except:
        return 'Unknown'

def main():
    with open('full_text.txt', 'r', encoding='utf-8') as f:
        text = f.read()

    # 1. EXTRACT COURSES
    # Anchor: \n([A-Z]{3}-\s?\d{3})\s*\|\s*Cr\.\s*Hrs\.\s*([\d\.]+)
    # We will find all matches and then extract the text between them
    courses = []
    
    matches = list(re.finditer(r'\n([A-Z]{3}-\s?\d{3})\s*\|\s*Cr\.\s*Hrs\.\s*([\d\.]+)', text))
    for i, match in enumerate(matches):
        code = match.group(1).replace(' ', '')
        cr_hrs = match.group(2)
        
        # Extract title (few lines before the match)
        prefix_text = text[:match.start()].strip().split('\n')
        # Title is usually the 2-3 lines before
        title_lines = []
        for line in reversed(prefix_text[-4:]):
            if 'COURSE OUTLINE' in line or '---PAGE_BREAK---' in line:
                break
            title_lines.insert(0, line.strip())
        title = " ".join(title_lines).strip()
        
        # Determine Professional
        professional = determine_professional(code)
        
        # Get body block
        start_pos = match.end()
        end_pos = matches[i+1].start() if i + 1 < len(matches) else len(text)
        body_text = text[start_pos:end_pos]
        
        # Outcomes, Contents, Readings
        outcomes = ""
        contents = ""
        readings = ""
        
        outcomes_match = re.search(r'Course Learning Outcomes(.*?)Contents', body_text, flags=re.S|re.I)
        if outcomes_match:
            outcomes = outcomes_match.group(1).strip()
            
        contents_match = re.search(r'Contents(.*?)Recommended Reading', body_text, flags=re.S|re.I)
        if contents_match:
            contents = contents_match.group(1).strip()
            
        readings_match = re.search(r'Recommended Reading(.*)', body_text, flags=re.S|re.I)
        if readings_match:
            # truncate till page break or end
            r_text = readings_match.group(1)
            r_text = r_text.split('FACULTY OF PHARMACY')[0].strip()
            readings = r_text
            
        # Fallback if parsing failed
        if not outcomes and not contents:
            contents = body_text.strip()[:1000] # just grab a chunk
            
        courses.append({
            "title": title,
            "code": code,
            "creditHours": cr_hrs,
            "professional": professional,
            "category": "Core" if "(Lab)" not in title else "Lab",
            "semesterName": "Unknown",
            "outcomes": outcomes,
            "contents": contents,
            "readings": readings
        })

    # 2. EXTRACT FACULTY
    # They appear after "FACULTY PROFILE" and end before "BOARD OF STUDIES"
    # We can use regex or known names
    fac_text_match = re.search(r'FACULTY PROFILE(.*?)BOARD OF STUDIES', text, flags=re.S)
    faculty = []
    if fac_text_match:
        fac_text = fac_text_match.group(1)
        # Find emails as anchors
        email_matches = list(re.finditer(r'Email\s*([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})', fac_text, flags=re.I))
        for i, m in enumerate(email_matches):
            email = m.group(1)
            # Designation is usually before Qualification
            block_start = 0 if i == 0 else email_matches[i-1].end()
            block = fac_text[block_start:m.end()]
            
            # extract name roughly
            # The name is usually big text before the bio
            words = block.split()
            name = "Dr. Unknown"
            dr_idx = [idx for idx, w in enumerate(words) if 'Dr.' in w]
            if dr_idx:
                name = " ".join(words[dr_idx[-1]:dr_idx[-1]+3]).strip()
                
            desig_match = re.search(r'(Professor|Associate Professor|Assistant Professor|Lecturer|Chairman)', block, flags=re.I)
            designation = desig_match.group(1) if desig_match else "Faculty"
            
            qual_match = re.search(r'Qualification(.*?)\(University', block, flags=re.S|re.I)
            qualification = qual_match.group(1).strip() if qual_match else ""
            
            faculty.append({
                "name": name.replace('\n', ' '),
                "email": email,
                "designation": designation,
                "department": "Pharmaceutics",
                "qualification": qualification,
                "password": "Softsols@123",
                "role": "TEACHER"
            })
            
    with open('extracted_details.json', 'w', encoding='utf-8') as f:
         json.dump({"courses": courses, "faculty": faculty}, f, indent=4)
         
    print(f"Extracted {len(courses)} courses and {len(faculty)} faculty.")

if __name__ == '__main__':
    main()
