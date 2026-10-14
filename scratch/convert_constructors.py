import re
import os

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    if "@RequiredArgsConstructor" not in content:
        return None

    # Check if already has a matching constructor
    class_match = re.search(r'public\s+(?:class|final\s+class)\s+(\w+)', content)
    if not class_match:
        return None
    class_name = class_match.group(1)

    # Find the body of the class before any methods or inner classes
    class_start = class_match.end()
    # Find all "private final [Type] [name];" fields declared at class level
    field_pattern = re.compile(r'^\s*private\s+final\s+([\w\<\>\[\],\s\?]+?)\s+(\w+)\s*;', re.MULTILINE)
    
    # We only want fields before the first method or constructor
    first_method = re.search(r'^\s*(?:public|protected|private|@Override|\bstatic\b)\s+(?:[\w\<\>\[\]]+\s+)?(\w+)\s*\(', content[class_start:], re.MULTILINE)
    search_limit = class_start + first_method.start() if first_method else len(content)
    
    fields = field_pattern.findall(content[class_start:search_limit])
    if not fields:
        print(f"Skipping {class_name}: no final fields found")
        return None

    # Clean field types and names
    clean_fields = [(f_type.strip(), f_name.strip()) for f_type, f_name in fields]

    # Generate constructor
    params = ", ".join([f"{f_type} {f_name}" for f_type, f_name in clean_fields])
    assignments = "\n".join([f"        this.{f_name} = {f_name};" for _, f_name in clean_fields])
    
    if len(clean_fields) <= 2:
        constructor = f"\n    public {class_name}({params}) {{\n{assignments}\n    }}\n"
    else:
        params_multiline = ",\n            ".join([f"{f_type} {f_name}" for f_type, f_name in clean_fields])
        constructor = f"\n    public {class_name}(\n            {params_multiline}) {{\n{assignments}\n    }}\n"

    # Remove @RequiredArgsConstructor annotation and import if not needed
    new_content = re.sub(r'@RequiredArgsConstructor\s*\n', '', content)
    # Check if RequiredArgsConstructor used elsewhere in file
    if "@RequiredArgsConstructor" not in new_content:
        new_content = re.sub(r'import\s+lombok\.RequiredArgsConstructor;\s*\n', '', new_content)

    # Insert constructor after the last field
    last_field = list(field_pattern.finditer(content[class_start:search_limit]))[-1]
    insertion_idx = class_start + last_field.end()
    
    # Re-calculate in new_content:
    # Find last field in new_content
    new_class_match = re.search(r'public\s+(?:class|final\s+class)\s+' + class_name, new_content)
    new_class_start = new_class_match.end()
    new_fields = list(field_pattern.finditer(new_content[new_class_start:]))
    if not new_fields:
        return None
    last_new_field = new_fields[len(fields)-1]
    insert_pos = new_class_start + last_new_field.end()

    final_content = new_content[:insert_pos] + "\n" + constructor + new_content[insert_pos:]
    return final_content

files_to_process = [
    r"c:\Users\divya\OneDrive\Desktop\Projects\MPLAD\backend\src\main\java\com\mplads\monitoring\service\impl\MapServiceImpl.java",
    r"c:\Users\divya\OneDrive\Desktop\Projects\MPLAD\backend\src\main\java\com\mplads\monitoring\service\impl\OfficialMpladsServiceImpl.java",
    r"c:\Users\divya\OneDrive\Desktop\Projects\MPLAD\backend\src\main\java\com\mplads\monitoring\service\impl\PhotoVerificationServiceImpl.java",
    r"c:\Users\divya\OneDrive\Desktop\Projects\MPLAD\backend\src\main\java\com\mplads\monitoring\service\impl\NotificationServiceImpl.java",
    r"c:\Users\divya\OneDrive\Desktop\Projects\MPLAD\backend\src\main\java\com\mplads\monitoring\service\impl\ProgressServiceImpl.java",
    r"c:\Users\divya\OneDrive\Desktop\Projects\MPLAD\backend\src\main\java\com\mplads\monitoring\service\impl\ReportServiceImpl.java",
    r"c:\Users\divya\OneDrive\Desktop\Projects\MPLAD\backend\src\main\java\com\mplads\monitoring\service\impl\UserServiceImpl.java",
    r"c:\Users\divya\OneDrive\Desktop\Projects\MPLAD\backend\src\main\java\com\mplads\monitoring\service\impl\RiskAlertServiceImpl.java",
    r"c:\Users\divya\OneDrive\Desktop\Projects\MPLAD\backend\src\main\java\com\mplads\monitoring\service\impl\ProjectServiceImpl.java",
    r"c:\Users\divya\OneDrive\Desktop\Projects\MPLAD\backend\src\main\java\com\mplads\monitoring\service\impl\LocationServiceImpl.java",
    r"c:\Users\divya\OneDrive\Desktop\Projects\MPLAD\backend\src\main\java\com\mplads\monitoring\service\impl\InsightsServiceImpl.java",
    r"c:\Users\divya\OneDrive\Desktop\Projects\MPLAD\backend\src\main\java\com\mplads\monitoring\service\impl\FundSimulationServiceImpl.java",
    r"c:\Users\divya\OneDrive\Desktop\Projects\MPLAD\backend\src\main\java\com\mplads\monitoring\service\impl\FinancialServiceImpl.java",
    r"c:\Users\divya\OneDrive\Desktop\Projects\MPLAD\backend\src\main\java\com\mplads\monitoring\service\impl\AuthServiceImpl.java",
    r"c:\Users\divya\OneDrive\Desktop\Projects\MPLAD\backend\src\main\java\com\mplads\monitoring\service\impl\AuditLogServiceImpl.java",
    r"c:\Users\divya\OneDrive\Desktop\Projects\MPLAD\backend\src\main\java\com\mplads\monitoring\service\impl\AgencyAnalyticsServiceImpl.java",
    r"c:\Users\divya\OneDrive\Desktop\Projects\MPLAD\backend\src\main\java\com\mplads\monitoring\service\impl\AdminDataImportServiceImpl.java",
    r"c:\Users\divya\OneDrive\Desktop\Projects\MPLAD\backend\src\main\java\com\mplads\monitoring\security\JwtAuthenticationFilter.java",
    r"c:\Users\divya\OneDrive\Desktop\Projects\MPLAD\backend\src\main\java\com\mplads\monitoring\security\CustomUserDetailsService.java",
    r"c:\Users\divya\OneDrive\Desktop\Projects\MPLAD\backend\src\main\java\com\mplads\monitoring\config\SecurityConfig.java",
    r"c:\Users\divya\OneDrive\Desktop\Projects\MPLAD\backend\src\main\java\com\mplads\monitoring\controller\AlertController.java",
    r"c:\Users\divya\OneDrive\Desktop\Projects\MPLAD\backend\src\main\java\com\mplads\monitoring\controller\MapController.java",
    r"c:\Users\divya\OneDrive\Desktop\Projects\MPLAD\backend\src\main\java\com\mplads\monitoring\controller\PhotoVerificationController.java",
    r"c:\Users\divya\OneDrive\Desktop\Projects\MPLAD\backend\src\main\java\com\mplads\monitoring\controller\OfficialMpladsController.java",
    r"c:\Users\divya\OneDrive\Desktop\Projects\MPLAD\backend\src\main\java\com\mplads\monitoring\controller\ProgressController.java",
    r"c:\Users\divya\OneDrive\Desktop\Projects\MPLAD\backend\src\main\java\com\mplads\monitoring\controller\ProjectController.java",
    r"c:\Users\divya\OneDrive\Desktop\Projects\MPLAD\backend\src\main\java\com\mplads\monitoring\controller\ReportController.java",
    r"c:\Users\divya\OneDrive\Desktop\Projects\MPLAD\backend\src\main\java\com\mplads\monitoring\controller\PublicInsightsController.java",
    r"c:\Users\divya\OneDrive\Desktop\Projects\MPLAD\backend\src\main\java\com\mplads\monitoring\controller\NotificationController.java",
    r"c:\Users\divya\OneDrive\Desktop\Projects\MPLAD\backend\src\main\java\com\mplads\monitoring\controller\FinancialController.java",
    r"c:\Users\divya\OneDrive\Desktop\Projects\MPLAD\backend\src\main\java\com\mplads\monitoring\controller\DashboardController.java",
    r"c:\Users\divya\OneDrive\Desktop\Projects\MPLAD\backend\src\main\java\com\mplads\monitoring\controller\CollectorInspectionController.java",
    r"c:\Users\divya\OneDrive\Desktop\Projects\MPLAD\backend\src\main\java\com\mplads\monitoring\controller\AuthController.java",
    r"c:\Users\divya\OneDrive\Desktop\Projects\MPLAD\backend\src\main\java\com\mplads\monitoring\controller\AgencyAnalyticsController.java",
    r"c:\Users\divya\OneDrive\Desktop\Projects\MPLAD\backend\src\main\java\com\mplads\monitoring\controller\AdminUserController.java",
    r"c:\Users\divya\OneDrive\Desktop\Projects\MPLAD\backend\src\main\java\com\mplads\monitoring\controller\AdminImportController.java",
]

for f in files_to_process:
    res = process_file(f)
    if res:
        with open(f, 'w', encoding='utf-8') as out:
            out.write(res)
        print(f"Updated: {os.path.basename(f)}")
    else:
        print(f"Skipped/Failed: {os.path.basename(f)}")
