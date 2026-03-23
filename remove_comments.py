import os
import re

frontend_dir = r"c:\Users\Lenovo\OneDrive\Desktop\Bridgeon\interview projects\Roadoz Courier Dashboard\Frontend\src"
backend_views = r"c:\Users\Lenovo\OneDrive\Desktop\Bridgeon\interview projects\Roadoz Courier Dashboard\Backend\apps\orders\views.py"

def clean_frontend(file_path):
    if not os.path.exists(file_path): 
        print(f"Not found: {file_path}")
        return
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Remove single line comments starting with //
    content = re.sub(r'^[ \t]*//.*$\n?', '', content, flags=re.MULTILINE)
    # Remove trailing single line comments
    content = re.sub(r'[ \t]+//.*$', '', content, flags=re.MULTILINE)
    
    # Remove {/* ... */} lines entirely if on their own line
    content = re.sub(r'^[ \t]*\{\/\*.*?\*\/}[ \t]*$\n?', '', content, flags=re.MULTILINE)
    
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write(content)

def clean_backend(file_path):
    if not os.path.exists(file_path): return
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # Remove custom comment blocks that look like # ──...
    content = re.sub(r'^[ \t]*#[ \t]*──.*$\n?', '', content, flags=re.MULTILINE)
    
    # Specific lines that are my comments
    lines_to_remove = [
        "N+1 Query Issue Fixed",
        "instead of calling .count()",
        "Run a single query with GROUP BY status",
        "Initialize all stats to 0",
        "Returns all data needed for the Dashboard page",
        "wallet: balance",
        "cod_summary:",
        "shipment_summary:",
        "RTO = RTO_IN_TRANSIT",
        "Pending = PICKUP_PENDING",
        "Wallet transaction breakdown for chart",
        "Ensure idempotent",
        "Cash with courier",
        "If advancing to IN_TRANSIT",
        "Seller ticks an order",
        "Any PICKUP_PENDING order older than 24h",
        "1. Manifested -> In transit",
        "2. Delivered ->",
        "4. Return/Cancelled Orders",
    ]
    
    new_lines = []
    for line in content.split('\n'):
        if any(rem in line for rem in lines_to_remove):
            continue
        # Catch other simple hashtag comments I might have added in the dashboard view
        if line.strip().startswith('#') and ('stats' in line.lower() or 'wallet' in line.lower() or 'cod' in line.lower() or 'order type' in line.lower() or 'trend' in line.lower()):
            continue
        new_lines.append(line)
        
    with open(file_path, 'w', encoding='utf-8') as f:
        f.write('\n'.join(new_lines))

files_to_clean = [
    os.path.join(frontend_dir, "components", "OrderFilterBar.jsx"),
    os.path.join(frontend_dir, "pages", "dashboard", "Dashboard.jsx"),
    os.path.join(frontend_dir, "pages", "dashboard", "ProcessingOrders.jsx"),
    os.path.join(frontend_dir, "pages", "dashboard", "orders", "Manifested.jsx"),
    os.path.join(frontend_dir, "pages", "dashboard", "orders", "InTransit.jsx"),
    os.path.join(frontend_dir, "pages", "dashboard", "orders", "NDR.jsx"),
    os.path.join(frontend_dir, "pages", "dashboard", "orders", "Pending.jsx"),
    os.path.join(frontend_dir, "pages", "dashboard", "orders", "Delivery.jsx"),
    os.path.join(frontend_dir, "pages", "dashboard", "orders", "OutOfDelivery.jsx"),
    os.path.join(frontend_dir, "pages", "dashboard", "orders", "RTOInTransit.jsx"),
    os.path.join(frontend_dir, "pages", "dashboard", "orders", "RTODelivery.jsx"),
    os.path.join(frontend_dir, "pages", "dashboard", "orders", "Return.jsx"),
    os.path.join(frontend_dir, "pages", "dashboard", "orders", "Cancelled.jsx"),
    os.path.join(frontend_dir, "pages", "dashboard", "orders", "NotPicked.jsx"),
    os.path.join(frontend_dir, "pages", "dashboard", "orders", "AllOrders.jsx"),
]

for f in files_to_clean:
    clean_frontend(f)

clean_backend(backend_views)

print("Done removing custom comments.")
