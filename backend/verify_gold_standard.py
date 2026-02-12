import openpyxl

def analyze_gold_standard(path):
    print(f"\n--- ANALIZANDO ESTÁNDAR DE ORO: {path} ---")
    try:
        wb = openpyxl.load_workbook(path, data_only=True)
        ws = wb.active
        print(f"Hoja: {ws.title}")
        
        # Mapeo de celdas críticas según el pedido del usuario
        coords = ['C1', 'C4', 'H1', 'A6', 'B6', 'E6', 'F6', 'A9', 'A11', 'A13', 'A16', 'E16']
        for coord in coords:
            val = ws[coord].value
            print(f"Celda {coord}: '{val}'")
            
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    analyze_gold_standard(r"c:\Users\Usuario\Documents\App asesor\backend\lab\static\templates\reclamo.xlsx")
