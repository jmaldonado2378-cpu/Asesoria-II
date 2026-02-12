import openpyxl

def analyze_excel(path):
    wb = openpyxl.load_workbook(path, data_only=True)
    ws = wb.active
    print(f"Hoja activa: {ws.title}")
    
    # Analizar celdas con contenido o formato
    for row in ws.iter_rows(min_row=1, max_row=40, min_col=1, max_col=10):
        for cell in row:
            if cell.value:
                coord = cell.coordinate
                val = cell.value
                bg_color = cell.fill.start_color.index if cell.fill else "None"
                print(f"Celda {coord}: '{val}' | Fondo: {bg_color}")

    # Analizar celdas combinadas
    print("\nCeldas combinadas:")
    for merged_range in ws.merged_cells.ranges:
        print(f"Rango: {merged_range}")

if __name__ == "__main__":
    analyze_excel(r"C:\Users\Usuario\Downloads\ultima.xlsx")
