import fitz

def extract_pdfs():
    print("Extracting c1.pdf...")
    with fitz.open('../c1.pdf') as doc_c1:
        with open('c1_extracted.txt', 'w', encoding='utf-8') as f:
            for page in doc_c1:
                f.write(page.get_text())
                
    print("Extracting ph1.pdf (pages 33-237)...")
    with fitz.open('../ph1.pdf') as doc_ph1:
        with open('ph1_extracted.txt', 'w', encoding='utf-8') as f:
            start_idx = 32  # page 33 is index 32
            end_idx = min(237, len(doc_ph1))
            for page_num in range(start_idx, end_idx):
                f.write(doc_ph1[page_num].get_text())
                
    print("Extraction complete.")

if __name__ == '__main__':
    extract_pdfs()
