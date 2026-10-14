import re
import os

files_to_check = [
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
    r"c:\Users\divya\OneDrive\Desktop\Projects\MPLAD\backend\src\main\java\com\mplads\monitoring\controller\LocationController.java",
    r"c:\Users\divya\OneDrive\Desktop\Projects\MPLAD\backend\src\main\java\com\mplads\monitoring\controller\FundSimulationController.java",
    r"c:\Users\divya\OneDrive\Desktop\Projects\MPLAD\backend\src\main\java\com\mplads\monitoring\controller\FinancialController.java",
    r"c:\Users\divya\OneDrive\Desktop\Projects\MPLAD\backend\src\main\java\com\mplads\monitoring\controller\DashboardController.java",
    r"c:\Users\divya\OneDrive\Desktop\Projects\MPLAD\backend\src\main\java\com\mplads\monitoring\controller\CollectorInspectionController.java",
    r"c:\Users\divya\OneDrive\Desktop\Projects\MPLAD\backend\src\main\java\com\mplads\monitoring\controller\AuthController.java",
    r"c:\Users\divya\OneDrive\Desktop\Projects\MPLAD\backend\src\main\java\com\mplads\monitoring\controller\AgencyAnalyticsController.java",
    r"c:\Users\divya\OneDrive\Desktop\Projects\MPLAD\backend\src\main\java\com\mplads\monitoring\controller\AdminUserController.java",
    r"c:\Users\divya\OneDrive\Desktop\Projects\MPLAD\backend\src\main\java\com\mplads\monitoring\config\DataInitializer.java",
    r"c:\Users\divya\OneDrive\Desktop\Projects\MPLAD\backend\src\main\java\com\mplads\monitoring\controller\AdminImportController.java",
]

print(f"Total files: {len(files_to_check)}")
for f in files_to_check:
    if not os.path.exists(f):
        print(f"MISSING: {f}")
    else:
        with open(f, 'r', encoding='utf-8') as fh:
            content = fh.read()
            if "@RequiredArgsConstructor" in content:
                print(f"OK (has annotation): {os.path.basename(f)}")
            else:
                print(f"NO ANNOTATION: {os.path.basename(f)}")
