import fitz

def main():
    doc = fitz.open('../ph1.pdf')
    # pages 33 to 237 correspond to indices 32 to 236
    text = ""
    for i in range(32, 237):
        try:
            page = doc.load_page(i)
            text += page.get_text() + "\n---PAGE_BREAK---\n"
        except:
            pass
            
    with open('full_text.txt', 'w', encoding='utf-8') as f:
        f.write(text)

if __name__ == '__main__':
    main()
