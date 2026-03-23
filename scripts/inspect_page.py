import fitz

def main():
    try:
        doc = fitz.open('../ph1.pdf')
        print("--- PAGE 32 ---")
        print(doc.load_page(31).get_text())
        print("--- PAGE 33 ---")
        print(doc.load_page(32).get_text())
        print("--- PAGE 34 ---")
        print(doc.load_page(33).get_text())
    except Exception as e:
        print(f"Error: {e}")

if __name__ == '__main__':
    main()
